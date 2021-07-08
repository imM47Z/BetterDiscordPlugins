/**
 * @name QuickDeleteMessages
 * @invite undefined
 * @authorLink undefined
 * @donate undefined
 * @patreon undefined
 * @website https://github.com/IamM47Z/BetterDiscordPlugins/blob/master/QuickDeleteMessages.plugin.js
 * @source https://raw.githubusercontent.com/IamM47Z/BetterDiscordPlugins/master/QuickDeleteMessages.plugin.js
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

module.exports = (() => {
    const config = {"info":{"name":"QuickDeleteMessages","authors":[{"name":"M47Z","discord_id":"398917073444798466","github_username":"IamM47Z"}],"version":"1.0.1","description":"This plugin allows you to delete messages by pressing delete button.","github":"https://github.com/IamM47Z/BetterDiscordPlugins/blob/master/QuickDeleteMessages.plugin.js","github_raw":"https://raw.githubusercontent.com/IamM47Z/BetterDiscordPlugins/master/QuickDeleteMessages.plugin.js"},"changelog":[{"title":"New Stuff","type":"improved","items":["Not using hardcoded constants and fixed issue with missing perms"]},{"title":"On-going","type":"progress","items":["Avoid Discord Rate-Limit (possible adjustable cooldown)"]}],"defaultConfig":[{"type":"switch","id":"confirmDelete","name":"Confirm Delete","note":"Show Confirm Popup when attempting to Delete Messages","value":true}],"main":"index.js"};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
    const { DiscordAPI, DiscordModules, DOMTools, WebpackModules } = Api;

    let _this;
    let MessageUtils;
    let mouseX, mouseY;
    let MessageClassNames = [];

    return class QuickDeleteMessages extends Plugin {
        onMouseMove(event) {
            mouseX = event.clientX;
            mouseY = event.clientY;
        }

        onKeyDown(event) {
            if (event.keyCode != 46 || (process.platform == "darwin" && event.keyCode != 27))
                return;

            let targetElem = document.elementFromPoint(mouseX, mouseY);
            if (!targetElem)
                return;
                
            let messageElem = targetElem.className.includes(MessageClassNames[0].message) ? targetElem : DOMTools.parents(targetElem, "." + MessageClassNames[0].message)[0];
            if (!messageElem)
                return;

            let messageInfo = BdApi.getInternalInstance(messageElem);
            if (!messageInfo)
                return;
            messageInfo = messageInfo.memoizedProps.children[3].props;
            
            if (!DiscordModules.DiscordConstants.MessageTypesDeletable[messageInfo.message.type] || !messageElem.querySelector("." + MessageClassNames[1].messageContent))
                return;

            if (messageInfo.message.author.id != DiscordAPI.currentUser.id && !DiscordModules.Permissions.can({data: 8192n}, DiscordAPI.currentUser.id, messageInfo.channel))
                return;

            if (!event.shiftKey && _this.settings["confirmDelete"])
                MessageUtils.confirmDelete(messageInfo.channel, messageInfo.message, false);
            else
                DiscordModules.MessageActions.deleteMessage(messageInfo.channel.id, messageInfo.message.id, messageInfo.message.state != DiscordModules.DiscordConstants.MessageStates.SENT);
        }

        onStart() {
            _this = this;

            MessageUtils = WebpackModules.getByProps("confirmDelete");
            MessageClassNames[0] = WebpackModules.getByProps("message", "cozyMessage");
            MessageClassNames[1] = WebpackModules.getByProps("messageContent", "hasReply");

            document.addEventListener("keydown", this.onKeyDown);
            document.addEventListener("mousemove", this.onMouseMove);
        }

        onStop() {
            document.removeEventListener("keydown", this.onKeyDown);
            document.removeEventListener("mousemove", this.onMouseMove);
        }

        getSettingsPanel() {
            const settingsPanel = this.buildSettingsPanel();

            return settingsPanel.getElement();
        }
    };
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
