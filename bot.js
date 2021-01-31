const fs = require("fs");
const Discord = require("discord.js");
const async = require("async");
const csv = require("fast-csv");

const client = new Discord.Client();


// DISCORD BOT CONFIGURATIONS
const config = {
    "prefix": "<"
};


// UTILITY FUNCTIONS
// Make directory if it does not exist
const mkdirp = (path, mask, cb) => {
    
    // allow the `mask` parameter to be optional
    if (typeof(mask) == 'function') {
        cb = mask;
        mask = 0777;
    }

    fs.mkdir(path, mask, err => {
        if (err) {
            if (err.code == 'EEXIST') {
                cb(null);            
            } else {
                cb(err);
            } 
        } else {
            cb(null);
        } 
    });
}


// DISCORD BOT COMMANDS
const ping = async (message) => {
    console.log(ping);
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
}

const me = async (message) => {
    console.log(me);

    const embed = new Discord.RichEmbed()
        .setThumbnail(message.author.displayAvatarURL)
        .setTitle(`${message.author.username}#${message.author.discriminator}`)
        .addField("id", message.author.id)
        .addField("username", message.author.username)
        .addField("discriminator", message.author.discriminator)
        .addField("bot", message.author.bot);

    await message.channel.send(embed);
}

const roles = async (message) => {
    console.log(roles);

    console.log("Opening stream...");
    const csvPath = `./tmp/${message.guild.id}-roles.csv`;
    const csvStream = csv.createWriteStream({headers: true});
    const writeStream = fs.createWriteStream(csvPath);

    writeStream.on("finish", function() {
        console.log("Closing stream...");
    });

    csvStream.pipe(writeStream);

    message.guild.roles.map(role => {
        csvStream.write({
            role_id: role.id,
            role_name: role.name,
            permissions: role.permissions,
            mentionable: role.mentionable,
            managed: role.managed,
            deleted: role.deleted,
            hoist: role.hoist,
            color: role.color,
            position: role.position
        });
    });

    csvStream.end();

    const attachment = new Discord.Attachment(csvPath, `${message.guild.name}-roles.csv`);
    await message.channel.send({file: attachment});
    fs.unlink(csvPath, err => { if (err) console.error(err) });
}

const members = async (message) => {
    console.log(members);

    console.log("Opening stream...");
    const csvPath = `./tmp/${message.guild.id}-members.csv`;
    const csvStream = csv.createWriteStream({headers: true});
    const writeStream = fs.createWriteStream(csvPath);

    writeStream.on("finish", function() {
        console.log("Closing stream...");
    });

    csvStream.pipe(writeStream);

    message.guild.members.map(member => {
        csvStream.write({
            id: member.user.id,
            nickname: member.nickname,
            name:  member.user.username,
            discriminator: member.user.discriminator,
            bot: member.user.bot,
            joined_timestamp: member.joinedTimestamp,
            roles: member._roles.join(" "),
            server_deaf: member.serverDeaf,
            server_mute: member.serverMute,
            deleted: member.deleted
        });
    });

    csvStream.end();

    const attachment = new Discord.Attachment(csvPath, `${message.guild.name}-members.csv`);
    await message.channel.send({file: attachment});
    fs.unlink(csvPath, err => { if (err) console.error(err) });
}

const channels = async (message) => {
    console.log(channels);

    console.log("Opening stream...");
    const csvPath = `./tmp/${message.guild.id}-channels.csv`;
    const csvStream = csv.createWriteStream({headers: true});
    const writeStream = fs.createWriteStream(csvPath);

    writeStream.on("finish", function() {
        console.log("Closing stream...");
    });

    csvStream.pipe(writeStream);

    message.guild.channels.map(channel => {
        let typeSpecific = {};

        if (channel.type === "text"){
            typeSpecific = {
                topic: channel.topic,
                rate_limit_per_user: channel.rateLimitPerUser,
                nsfw: channel.nsfw,
                deleted: channel.deleted,
                bitrate: null,
                user_limit: null
            };
        }

        if (channel.type === "voice") {
            typeSpecific = {
                topic: null,
                rate_limit_per_user: null,
                nsfw: null,
                deleted: null,
                bitrate: channel.bitrate,
                user_limit: channel.userLimit
            };
        }

        csvStream.write({
            id: channel.id,
            name: channel.name,
            type: channel.type,
            position: channel.position,
            ...typeSpecific
        });
    });

    csvStream.end();

    const attachment = new Discord.Attachment(csvPath, `${message.guild.name}-channels.csv`);
    await message.channel.send({file: attachment});
    fs.unlink(csvPath, err => { if (err) console.error(err) });
}

const channelInfo = async (message) => {
    console.log(channelInfo);

    const embed = new Discord.RichEmbed()
        .setTitle(message.channel.name)
        .addField("id", message.channel.id)
        .addField("name", message.channel.name)
        .addField("type", message.channel.type)
        .addField("position", message.channel.position)
        .addField("topic", message.channel.topic || null)
        .addField("rate limit per user", message.channel.rateLimitPerUser)
        .addField("nsfw", message.channel.nsfw);

    await message.channel.send(embed);
}

const guildInfo = async (message) => {
    console.log(guildInfo);

    const embed = new Discord.RichEmbed()
        .setThumbnail(message.guild.iconURL)
        .setTitle(message.guild.name)
        .addField("id", message.guild.id)
        .addField("name", message.guild.name)
        .addField("region", message.guild.region)
        .addField("member count", message.guild.memberCount)
        .addField("afk timeout", message.guild.afkTimeout)
        .addField("afk channel id", message.guild.afkChannelID)
        .addField("afk channel name", message.guild.afkChannelID ? message.guild.channels.get(message.guild.afkChannelID).name : null)
        .addField("system channel id", message.guild.systemChannelID)
        .addField("system channel name", message.guild.systemChannelID ? message.guild.channels.get(message.guild.systemChannelID).name : null)
        .addField("owner id", message.guild.ownerID)
        .addField("owner nickname", message.guild.members.get(message.guild.ownerID).nickname)
        .addField("created at", message.guild.createdAt);

    await message.channel.send(embed);
}

const emojis = async (message) => {
    console.log(emojis);

    let emojiMessage = "";

    message.guild.emojis.map(emoji => emojiMessage = emojiMessage + `<:${emoji.identifier}> `);

    await message.channel.send(emojiMessage);
}

const messages = async (message, args) => {
    console.log(messages);

    let messagesRetrieved = 0;
    let beforeMessageId = message.id;
    let messageLimit = Number(args[0]);

    if (messageLimit < 1) {
        await message.reply("Usage: <extract> [number of messages] \n Number of messages must be greater than 0 if specified.");
        return;
    }

    const limit = messageLimit ? true : false;

    console.log("Opening stream...");
    const csvPath = `./tmp/${message.channel.name}.${message.id}.csv`;
    const csvStream = csv.createWriteStream({headers: true});
    const writeStream = fs.createWriteStream(csvPath);

    writeStream.on("finish", function() {
        console.log("Closing stream...");
    });

    csvStream.pipe(writeStream);

    // async do while loop
    // https://caolan.github.io/async/docs.html#doWhilst
    async.doWhilst(
        next => {
            console.log("messageLimit", messageLimit);
            const apiLimit = limit && messageLimit < 100 ? messageLimit : 100;
            console.log("apiLimit", apiLimit);
            
            message.channel.fetchMessages({limit: apiLimit, before: beforeMessageId})
                .then(msgs => {
                    if (limit) messageLimit = messageLimit - msgs.size;

                    messagesRetrieved = msgs.size;
                    console.log("messagesRetrieved", messagesRetrieved);

                    if (!limit && messagesRetrieved === 0) {
                        next();
                    } else {
                        beforeMessageId = msgs.last().id;

                        // fast-csv mapping
                        // Diverging from camelCase since the property names are used as CSV headers...
                        // https://c2fo.io/fast-csv/index.html
                        msgs.map(msg => {
                            // msg.attachments.map(msg_attachment => console.log(msg_attachment.url));
                            const attachmentsURLArray = msg.attachments.array().map(attachment => attachment.url).join(" ");

                            csvStream.write({
                                msg_id: msg.id,
                                author_id: msg.author.id,
                                author: msg.author.username,
                                content: msg.content.replace(/[\n\r]/gm, ""),
                                attachment_urls: attachmentsURLArray,
                                pinned: msg.pinned,
                                created_at: msg.createdAt,
                                edited_at: msg.editedAt
                            });
                        });
    
                        next();    
                    }
                })
                .catch(console.error);
        }, () => { 
            return messagesRetrieved > 0 && (!limit || messageLimit > 0);
        }, async err => {
            csvStream.end();
            if (err) {
                console.error(err.message);
            } else {
                const attachment = new Discord.Attachment(csvPath, `${message.channel.name}-msgs.csv`);
                await message.channel.send({file: attachment});
                fs.unlink(csvPath, err => { if (err) console.error(err) });
            }
        }
    );
}

const help = async (message) => {
    console.log(help);

    const embed = new Discord.RichEmbed()
        .setThumbnail(client.user.displayAvatarURL)
        .setTitle("help")
        .addField("<messages>", "Create a CSV with all of this channel's messages and message data.")
        .addField("<messages> [number]", "Create a CSV with this channel's past [number] messages and message data.")
        .addField("<guild>", "Display an embed with this guild's data.")
        .addField("<channel>", "Display an embed with this channel's data.")
        .addField("<channels>", "Create a CSV with this guild's channel data.")
        .addField("<members>", "Create a CSV with this guild's member data.")
        .addField("<roles>", "Create a CSV with this guild's role data.")
        .addField("<me>", "Display an embed with data about you.")
        .addField("<emoji>", "Display all server specific emojis.");

    await message.channel.send(embed);
}

// DISCORD BOT EVENTS
client.on("ready", () => {
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`);
    client.user.setActivity("<help>");
});

client.on("guildCreate", guild => {
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

client.on("guildDelete", guild => {
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
});

// Command handler
client.on("message", async message => {
    // Cease execution if the message author is a bot, or the message does not begin with the specified prefix.`
    if (message.author.bot) return;
    if (message.content.indexOf(config.prefix) !== 0) return;

    // Separate our "command" name, and our "arguments" for the command. 
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    console.log(`COMMAND: <${command}`);

    switch (command) {
        case "ping>":
            ping(message);
            break;
        case "help>":
            help(message);
            break;
        case "messages>":
            messages(message, args);
            break;
        case "guild>":
            guildInfo(message);
            break;
        case "channel>":
            channelInfo(message);
            break;
        case "channels>":
            channels(message);
            break;
        case "members>":
            members(message);
            break;
        case "roles>":
            roles(message);
            break;
        case "me>":
            me(message);
            break;
        case "emoji>":
        case "emojis>":
            emojis(message);
            break;
    }
});


// MAIN SCRIPT
const main = () => {
    // Create a tmp folder if it doesn't exist
    mkdirp(__dirname + '/tmp', 0744, err => { if (err) console.error(err) });

    // Discord bot login to discord.
    client.login(process.env.TOKEN);
}

main();
