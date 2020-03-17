//META { "name": "QuickDeleteMessages" } *//
global.QuickDeleteMessages = function () {
    var EndpointMessages,
    MessagePrompts,
    Permissions,
    UserStore,
    _qualifies,
    getOwnerInstance,
    gotDeletePermission,
    onClick,
    settings;
	
	const keysBeingPressed = [];

    class QuickDeleteMessages {
        getName() {
            return "Quick Delete Messages";
        }

        getDescription() {
            return "Hold Delete and click a Message to delete it.";
        }

        getAuthor() {
            return "square updated by M47Z";
        }

        getVersion() {
            return "2.0.0";
        }

        async start() {
            var ref;
            settings.confirm = (ref = BdApi.getData("QuickDeleteMessagesData", "confirm")) != null ? ref : false;
            if (UserStore == null)
                UserStore = BdApi.findModuleByProps("getCurrentUser");
			
            if (Permissions == null)
                Permissions = BdApi.findModuleByProps("computePermissions");
			
            if (EndpointMessages == null)
                EndpointMessages = BdApi.findModuleByProps("deleteMessage");
			
            if (MessagePrompts == null)
                MessagePrompts = BdApi.findModuleByProps("confirmDelete");

            window.addEventListener('keyup', (e) =>	keysBeingPressed.splice( keysBeingPressed.indexOf(e.key), 1 ) );
            window.addEventListener('keydown', (e) => {
				if ( keysBeingPressed.indexOf( e.key ) > -1 )
					return;
				
				keysBeingPressed[ keysBeingPressed.length ] = e.key;
			});
            return document.addEventListener("click", onClick, true);
        }

        stop() {
            window.removeEventListener('keyup', (e) =>	keysBeingPressed.splice( keysBeingPressed.indexOf(e.key), 1 ) , true);
            window.removeEventListener('keydown', (e) => {
				if ( keysBeingPressed.indexOf( e.key ) > -1 )
					return;
				
				keysBeingPressed[ keysBeingPressed.length ] = e.key;
			}, true);
            return document.removeEventListener("click", onClick, true);
        }

        getSettingsPanel() {
            return `<label style="color: #87909C"><input type="checkbox" name="confirm" onChange="QuickDeleteMessages.updateSettings(this)"\n${settings.confirm && "checked" || ""} />confirm delete?</label>`;
        }

        static updateSettings({
            name,
            checked
        }) {
            settings[name] = checked;
            BdApi.saveData("QuickDeleteMessages", name, checked);
        }

    };

    settings = Object.create(null);

    Permissions = UserStore = EndpointMessages = MessagePrompts = null;

    _qualifies = ".message-2qnXI6, .cozyMessage-3V1Y8y";

    IsKeyBeingPressed = (key) => keysBeingPressed.indexOf(key) > -1;

    onClick = function (event) {
        var channel,
        element,
        message,
        shiftKey;
        if (!(IsKeyBeingPressed("Delete") || "darwin" === process.platform && IsKeyBeingPressed("Backspace"))) {
            return;
        }
        ({
            path: [element],
            shiftKey
        } = event);
        if (!(element.matches(_qualifies) || (element = element.closest(_qualifies)))) {
            return;
        }
        ({
            memoizedProps: {
                children: {
                    1: {
                        props: {
                            channel,
                            message
                        }
                    }
                }
            }
        } = BdApi.getInternalInstance(element));
        if (!gotDeletePermission(channel, message))
            return;
			
        if (settings.confirm && !shiftKey)
            MessagePrompts.confirmDelete(channel, message, false);
        else
            EndpointMessages.deleteMessage(channel.id, message.id, false);
		
        event.preventDefault();
        event.stopImmediatePropagation();
    };

    gotDeletePermission = function (channel, message) {
        var self;
        self = UserStore.getCurrentUser();
        return self === message.author || 0x2000 & Permissions.computePermissions(self, channel);
    };

    return QuickDeleteMessages;
}
.call(this);
