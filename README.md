# ionic-native-sync-demo

Demo app for [ionic-native-sync](https://github.com/pervasync/ionic-native-sync) which provides
two way, incremental sync between Ionic Native SQLite databases and MySQL, Oracle, MS SQL Server and PostgreSQL databases.

## Setup

For end-to-end testing, you need to first setup a Pervasync server and publish your central database tables for sync. See [Pervasync documentation](https://docs.google.com/document/u/1/d/1Oioo0MxSArRgBdZ0wmLND-1AdzVLyolNd-yWw59tIC8/pub) for instructions.

Download and unpack the ionic-native-sync-demo app zip file. Run

    npm install

## Edit Source Files

Review and edit the foloowing files in `ionic-native-sync-demo\src\app\home`:

    home.page.html
    home.page.ts

## Test On Simulators

### Android

To test on Android, if your sync server is setup with plain HTTP instead of HTTPS, you will need to add your server to the domain list that have cleartextTrafficPermitted set to "true" by editing `ionic-native-sync-demo/resources/android/xml/network_security_config.xml`. For example:

    <network-security-config>
        <domain-config cleartextTrafficPermitted="true">
            <domain includeSubdomains="true">localhost</domain>
            <domain includeSubdomains="true">192.168.0.6</domain>        
        </domain-config>
    </network-security-config>

Build and install for Android

    cd ionic-native-sync-demo
    ionic cordova build android
    adb install platforms/android/app/build/outputs/apk/debug/app-debug.apk

You could use [Android device file explorer](https://developer.android.com/studio/debug/device-file-explorer) to check the SQLite databases and folders synced.

### iOS

Build and install for iOS

    ionic cordova build ios
    ionic cordova emulate ios --livereload --consolelogs 

To find the simulator locations of the synced SQLite databases and file folders, 

    cd ~/Library/Developer/CoreSimulator/Devices/ 
    find . -name pvcadmin__0.db
    ./6328A886-853F-40E0-BC65-A5FA1DFB1E03/data/Containers/Data/Application/57B0DD1F-E23B-47CC-8739-8920A5314320/Library/LocalDatabase/pvcadmin__0.db

The databases would be in `Library/LocalDatabase` and the sync folders would be in `Library/NoCloud`.


