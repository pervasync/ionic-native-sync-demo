import { Component } from '@angular/core';

import { ChangeDetectorRef } from '@angular/core';
import { AlertController, Platform } from '@ionic/angular';
import { File } from '@ionic-native/file';
import INSync from 'ionic-native-sync';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  syncState = {};
  constructor(private platform: Platform, private alertController: AlertController,
    private changeDetectorRef: ChangeDetectorRef) {

    // "bind" the sync methods with "this" so that 
    // the methods could access instance properties like "syncState"
    this.doSync = this.doSync.bind(this);
    this.onSyncStateChange = this.onSyncStateChange.bind(this);

    // Prepare "settings" which contains sync server connection info. 
    let settings = {
      "syncServerUrl": "http://192.168.0.2:8080/pervasync/server",
      "syncUserName": "user_1",
      "syncUserPassword": "welcome1",
      "onSyncStateChange": this.onSyncStateChange
    };

    // Pass the settings to ionic-native-sync via "INSync.config(settings)"
    // first thing after app is started (platform ready)
    this.platform.ready().then(async (readySource) => {
      console.log('Platform ready from', readySource);
      console.log("Calling INSync.config");
      await INSync.config(settings);
    });
  }

  /**
   * Method to start a sync session. Invoke in an action listener
   */
  async doSync() {
    console.log("Calling INSync.sync");
    await INSync.sync();
  }

  /**
   * Sync status change listener. Register the listener in "settings" arg of "INSync.config(settings)"
   * @param state Possible values: READY, COMPOSING, SENDING, RECEIVING, PROCESSING, SUCCEEDED, FAILED
   * @param progress Sync progress with a value between 0 and 1
   * @param syncSummary A JSON object contains detailed sync info. Sample: 
   * {"syncBeginTime":1583825680054,"checkInDIU_requested":[0,0,0],"checkInDIU_done":[0,0,0],
   * "refreshDIU_requested":[0,2028,0],"refreshDIU_done":[0,3,2025],
   * "hasDefChanges":true,"hasDataChanges":true,"errorCode":-1,"checkInStatus":"SUCCESS",
   * "checkInSchemaNames":["schema1","schema2"],"refreshSchemaNames":["schema1","schema2"],
   * "checkInFolderNames":[],"refreshFolderNames":["folder1"],"refreshStatus":"SUCCESS",
   * "serverSnapshotAge":8151664,"user":"user_1","device":"DEFAULT","syncDirection":"TWO_WAY",
   * "syncErrorMessages":"","syncErrorStacktraces":"","syncSchemaNames":["schema1","schema2"],
   * "syncFolderNames":["folder1"],"uploadBeginTime":1583825680060,"sessionId":1583825680060,
   * "downloadBeginTime":1583825689143,"syncEndTime":1583825727533,"syncDuration":"47.479 seconds"}
   */
  async onSyncStateChange(state, progress, syncSummary) {
    console.log("onSyncStateChange, state=" + state + ", progress=" + progress);
    if (syncSummary) {
      console.log("onSyncStateChange, syncSummary=" + JSON.stringify(syncSummary));
    }

    this.syncState['state'] = state;
    this.syncState['progress'] = progress;
    this.syncState['summary'] = JSON.stringify(syncSummary);
    this.changeDetectorRef.detectChanges();

    if ('SUCCEEDED' == state || 'FAILED' == state) {
      const alert = await this.alertController.create({
        header: 'Sync Completed',
        subHeader: 'Result: ' + state,
        message: 'Sync Summary: ' + JSON.stringify(syncSummary),
        buttons: ['OK']
      });

      alert.present();
    }
  }

  // method to duplicate an existing file
  async copyFile() {
    // "folder1" is the published sync folder name 
    // "INSync.getPath" will return its local path
    let message = '';
    try {
      let path = await INSync.getPath("folder1");
      console.log("copyFile, path=" + path);
      await File.copyFile(path, "Shared/ladies_t.jpg", path, "Shared/ladies_t_from_ionic.jpg");
      message = "Copy file succeeded.";
    } catch (error) {
      message = "Copy file failed with error: " + JSON.stringify(error);
    } finally {
      const alert = await this.alertController.create({
        header: 'Done',
        message: message,
        buttons: ['OK']
      });

      alert.present();
    }
  }

  // method to delete the copied file
  async deleteCopiedFile() {
    // "folder1" is the published sync folder name 
    // "INSync.getPath" will return it's local path
    let message = '';
    try {
      let path = await INSync.getPath("folder1");
      console.log("copyFile, path=" + path);
      await File.removeFile(path, "Shared/ladies_t_from_ionic.jpg");
      message = "Delete copied file succeeded.";
    } catch (error) {
      message = "Delete copied file failed with error: " + JSON.stringify(error);
    } finally {
      const alert = await this.alertController.create({
        header: 'Done',
        message: message,
        buttons: ['OK']
      });

      alert.present();
    }
  }

  // method to create a new row
  async insertRecord() {
    // "schema1" is the published sync schema name 
    // "INSync.openSchemaDb" will return it's local DB
    let message = '';
    let schemaDb = null;
    let sql = '';
    let rs = null;
    try {
      schemaDb = await INSync.openSchemaDb("schema1");

      //test INSERT
      sql = "BEGIN TRANSACTION";
      await schemaDb.executeSql(sql, []);
      sql = "INSERT INTO executives(ID, NAME, TITLE, BIOGRAPHY, IMAGE) VALUES (?, ?, ?, ' ', '20')";
      await schemaDb.executeSql(sql, [9999, 'Pervasync', 'Ionic Native']);
      sql = "INSERT INTO employees(ID, NAME, TITLE, BINARY_DATA) VALUES (?, ?, ?, '20')";
      await schemaDb.executeSql(sql, [9999, 'Pervasync', 'Ionic Native']);
      sql = "COMMIT TRANSACTION";
      await schemaDb.executeSql(sql, []);

      // test SELECT
      sql = "SELECT ID, NAME, TITLE FROM executives WHERE ID=9999";
      rs = await schemaDb.executeSql(sql, []);
      if (rs.rows.length > 0) {
        let name = rs.rows.item(0)['NAME'];
        console.log("Executive name: " + name);
      }

      message = "Insert record succeeded.";
    } catch (error) {
      message = "Insert record failed with error: " + JSON.stringify(error);
    } finally {
      if (schemaDb) {
        schemaDb.close();
      }
      const alert = await this.alertController.create({
        header: 'Done',
        message: message,
        buttons: ['OK']
      });

      alert.present();
    }
  }

  // method to delete the inereted row
  async deleteRecord() {
    // "schema1" is the published sync schema name 
    // "INSync.openSchemaDb" will return it's local DB
    let message = '';
    let schemaDb = null;
    let sql = '';
    let rs = null;
    try {
      schemaDb = await INSync.openSchemaDb("schema1");

      //test Delete
      sql = "DELETE FROM executives WHERE ID=9999";
      rs = await schemaDb.executeSql(sql, []);
      sql = "DELETE FROM employees WHERE ID=9999";
      rs = await schemaDb.executeSql(sql, []);

      message = "Delete record succeeded. rs.rowsAffected=" + rs.rowsAffected;
    } catch (error) {
      message = "Delete record failed with error: " + JSON.stringify(error);
    } finally {
      if (schemaDb) {
        schemaDb.close();
      }
      const alert = await this.alertController.create({
        header: 'Done',
        message: message,
        buttons: ['OK']
      });

      alert.present();
    }
  }

  // method to update an existing row
  async updateRecord() {
    // "schema1" is the published sync schema name 
    // "INSync.openSchemaDb" will return it's local DB
    let message = '';
    let schemaDb = null;
    let sql = '';
    let rs = null;
    try {
      schemaDb = await INSync.openSchemaDb("schema1");

      //test Delete
      sql = "UPDATE executives SET TITLE='From Ionic native' WHERE ID=1";
      rs = await schemaDb.executeSql(sql, []);
      sql = "UPDATE employees SET TITLE='From Ionic native' WHERE ID=1";
      rs = await schemaDb.executeSql(sql, []);

      message = "Update record succeeded. rs.rowsAffected=" + rs.rowsAffected;
    } catch (error) {
      message = "Update record failed with error: " + JSON.stringify(error);
    } finally {
      if (schemaDb) {
        schemaDb.close();
      }
      const alert = await this.alertController.create({
        header: 'Done',
        message: message,
        buttons: ['OK']
      });

      alert.present();
    }
  }
}
