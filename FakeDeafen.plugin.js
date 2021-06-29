/**
    * @name FakeDeafen
    * @author M47Z
    * @description This plugin allows you to fake deafen/mute in voice chat.
    * @version 1.0.0
    * @source https://github.com/IamM47Z/BetterDiscordPlugins/blob/master/FakeDeafen.plugin.js
    * @updateUrl https://raw.githubusercontent.com/IamM47Z/BetterDiscordPlugins/master/FakeDeafen.plugin.js
    */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();
@else@*/
/* Generated Code */
module.exports = (_ => {
    const config = {
        "info": {
            "name": "FakeDeafenToggle",
            "author": "M47Z",
            "version": "1.0.0",
            "description": "This plugin allows you to fake deafen/mute in voice chat."
        }
    };

    return (window.Lightcord || window.LightCord) ? class {
        getName() { return config.info.name; }
        getAuthor() { return config.info.author; }
        getVersion() { return config.info.version; }
        getDescription() { return "Do not use LightCord!"; }
        load() { BdApi.alert("Attention!", "By using LightCord you are risking your Discord Account, due to using a 3rd Party Client. Switch to an official Discord Client (https://discord.com/) with the proper BD Injection (https://betterdiscord.app/)"); }
        start() { }
        stop() { }
    } : !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
        getName() { return config.info.name; }
        getAuthor() { return config.info.author; }
        getVersion() { return config.info.version; }
        getDescription() { return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it. \n\n${config.info.description}`; }

        downloadLibrary() {
            require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
                if (!e && b && r.statusCode == 200) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => BdApi.showToast("Finished downloading BDFDB Library", { type: "success" }));
                else BdApi.alert("Error", "Could not download BDFDB Library Plugin. Try again later or download it manually from GitHub: https://mwittrien.github.io/downloader/?library");
            });
        }

        load() {
            if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, { pluginQueue: [] });
            if (!window.BDFDB_Global.downloadModal) {
                window.BDFDB_Global.downloadModal = true;
                BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onCancel: _ => { delete window.BDFDB_Global.downloadModal; },
                    onConfirm: _ => {
                        delete window.BDFDB_Global.downloadModal;
                        this.downloadLibrary();
                    }
                });
            }
            if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
        }
        start() { this.load(); }
        stop() { }
        getSettingsPanel() {
            let template = document.createElement("template");
            template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
            template.content.firstElementChild.querySelector("a").addEventListener("click", this.downloadLibrary);
            return template.content.firstElementChild;
        }
    } : (([Plugin, BDFDB]) => {
        var _this;
        var toggleButton;
        var fake = false;

        const DeafenToggleComponent = class DeafenToggle extends BdApi.React.Component {
            componentDidMount() {
                toggleButton = this;
            }
            render() {
                return BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.PanelButton, Object.assign({}, this.props, {
                    tooltipText: !fake ? "Fake Deafen" : "Disable Fake Deafen",
                    icon: iconProps => BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SvgIcon, Object.assign({}, iconProps, {
                        nativeClass: true,
                        width: 20,
                        height: 20,
                        foreground: BDFDB.disCN.accountinfobuttonstrikethrough,
                        name: !fake ? BDFDB.LibraryComponents.SvgIcon.Names.CHECKBOX_EMPTY : BDFDB.LibraryComponents.SvgIcon.Names.CHECKBOX
                    })),
                    onClick: _ => {
                        _this.settings.general[!fake ? "playEnable" : "playDisable"] && BDFDB.LibraryModules.SoundUtils.playSound(_this.settings.selections[!fake ? "enableSound" : "disableSound"], .4);
                        fake = !fake;

                        if (fake && !BDFDB.LibraryModules.MediaDeviceUtils.isSelfDeaf())
                            BDFDB.LibraryModules.MediaDeviceSetUtils.toggleSelfDeaf();

                        BDFDB.LibraryModules.MediaDeviceUtils.getMediaEngine().connections.forEach((engine) => {
                            if (engine.context != "default")
                                return;

                            engine.setSelfDeaf((BDFDB.LibraryModules.MediaDeviceUtils.isSelfDeaf() && !fake));
                        });
                    }
                }));
            }
        };

        var sounds = [];

        return class FakeDeafenToggle extends Plugin {
            onLoad() {
                _this = this;

                sounds = [(BDFDB.ModuleUtils.findByString("undeafen", "deafen", "robot_man", "mute", false) || { exports: { keys: (_ => []) } }).exports.keys()].flat(10).filter(n => n).map(s => s.replace("./", "").split(".")[0]).sort();

                this.defaults = {
                    general: {
                        playEnable: { value: true, description: "Play Enable Sound" },
                        playDisable: { value: true, description: "Play Disable Sound" }
                    },
                    selections: {
                        enableSound: { value: "stream_started", description: "Enable Sound" },
                        disableSound: { value: "stream_ended", description: "Disable Sound" }
                    }
                };

                this.patchedModules = {
                    after: {
                        Account: "render"
                    }
                };
            }

            hookSelfDeaf() {
                BDFDB.LibraryModules.MediaDeviceUtils.getMediaEngine().connections.forEach((engine) => {
                    if (engine.context != "default")
                        return;

                    BDFDB.PatchUtils.patch(this, engine, "setSelfDeaf", {
                        before: e => {
                            if (fake)
                                e.methodArguments[0] = false;
                        }
                    });
                });
            }

            onStart() {
                BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.SettingsUtils, "updateLocalSettings", { after: e => BDFDB.ReactUtils.forceUpdate(toggleButton) });

                BDFDB.PatchUtils.patch(this, BDFDB.LibraryModules.MediaDeviceUtils.getMediaEngine()._events, "connection", {
                    after: e => this.hookSelfDeaf()
                });

                this.hookSelfDeaf();

                BDFDB.PatchUtils.forceAllUpdates(this);
            }

            onStop() {
                BDFDB.PatchUtils.forceAllUpdates(this);
            }

            getSettingsPanel(collapseStates = {}) {
                let settingsPanel;
                return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, {
                    collapseStates: collapseStates,
                    children: _ => {
                        let settingsItems = [];

                        for (let key in this.defaults.general) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
                            type: "Switch",
                            plugin: this,
                            keys: ["general", key],
                            label: this.defaults.general[key].description,
                            value: this.settings.general[key]
                        }));

                        for (let key in this.defaults.selections) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
                            type: "Select",
                            plugin: this,
                            keys: ["selections", key],
                            label: this.defaults.selections[key].description,
                            basis: "50%",
                            options: sounds.map(o => ({ value: o, label: o.split(/[-_]/g).map(BDFDB.LibraryModules.StringUtils.upperCaseFirstChar).join(" ") })),
                            value: this.settings.selections[key],
                            onChange: value => BDFDB.LibraryModules.SoundUtils.playSound(value, 0.4)
                        }));

                        return settingsItems;
                    }
                });
            }

            processAccount(e) {
                let [children, index] = BDFDB.ReactUtils.findParent(e.returnvalue, { name: "PanelButton" });
                if (index > -1) {
                    e.returnvalue.props.className = BDFDB.DOMUtils.formatClassName(e.returnvalue.props.className, BDFDB.disCN._gameactivitytoggleadded);
                    children.unshift(BDFDB.ReactUtils.createElement(DeafenToggleComponent, {}));
                }
            }
        };
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
