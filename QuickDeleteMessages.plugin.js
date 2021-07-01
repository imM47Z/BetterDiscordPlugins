/**
    * @name QuickDeleteMessages
    * @author M47Z
    * @description This plugin allows you to delete messages by pressing delete button.
    * @version 1.0.0
    * @source https://github.com/IamM47Z/BetterDiscordPlugins/blob/master/QuickDeleteMessages.plugin.js
    * @updateUrl https://gitcdn.link/repo/IamM47Z/BetterDiscordPlugins/master/QuickDeleteMessages.plugin.js
    */

module.exports = (_ => {
    const config = {
        "info": {
            "name": "QuickDeleteMessages",
            "author": "M47Z",
            "version": "1.0.0",
            "description": "This plugin allows you to delete messages by pressing delete button."
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
        return class QuickDeleteMessages extends Plugin {
            onLoad() {
                this.defaults = {
                    general: {
                        confirmDelete: { value: true, description: "Confirm Delete" }
                    }
                };
            }

            onStart() {
                window._BDFDB = BDFDB;

                BDFDB.ListenerUtils.add(this, document, "keydown", event => {
                    if (event.keyCode != BDFDB.LibraryModules.KeyEvents("delete") || !BDFDB.DOMUtils.getParent(BDFDB.dotCN.message, document.activeElement))
                        return;

                    let messageInternalInstance = BdApi.getInternalInstance(BDFDB.DOMUtils.getParent(BDFDB.dotCN.message, document.activeElement));
                    let messageInfo = messageInternalInstance.memoizedProps.children[3].props;

                    if (!BDFDB.DiscordConstants.MessageTypesDeletable[messageInfo.message.type])
                        return;

                    if (messageInfo.message.author.id != BDFDB.UserUtils.me.id && !BDFDB.UserUtils.can("MANAGE_MESSAGES", BDFDB.UserUtils.me.id, messageInfo.channel.id))
                        return;

                    if (this.settings.general["confirmDelete"])
                        BDFDB.ModuleUtils.findByProperties("confirmDelete").confirmDelete(messageInfo.channel, messageInfo.message, false);
                    else
                        BDFDB.LibraryModules.MessageUtils.deleteMessage(messageInfo.channel.id, messageInfo.message.id, messageInfo.message.state != BDFDB.DiscordConstants.MessageStates.SENT);
                });

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

                        return settingsItems;
                    }
                });
            }
        };
    })(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
