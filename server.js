const { CommandoClient, FriendlyError, SQLiteProvider } = require('discord.js-commando'),
	  path = require('path'),
	  { PlayerManager } = require("discord.js-lavalink"),
	  oneLine = require('common-tags').oneLine,
      dbaapi = require('discord-bots-api'),
      winston = require('winston'),
	  request = require('request'),
	  snekfetch = require('snekfetch'),
	  { MongoClient } = require('mongodb'),
	  MongoDBProvider = require('commando-provider-mongo');
const Discord = require('discord.js');
const client = new Discord.Client();
const ayarlar = require('./ayarlar.json');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
require('./util/eventLoader')(client);
const Jimp = require('jimp');
const db = require('quick.db');
const { GOOGLE_API_KEY } = require('./anahtarlar.json');
const YouTube = require('simple-youtube-api');
const queue = new Map();  
const youtube = new YouTube(GOOGLE_API_KEY);
const ytdl = require('ytdl-core');

var version = ayarlar.version;
var yapimci = ayarlar.yapimci;
var footer = ayarlar.footer;

const express = require('express');
const app = express();
const http = require('http');
    app.get("/", (request, response) => {
    response.sendStatus(200);
    });
    app.listen(process.env.PORT);
    setInterval(() => {
    http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
    }, 280000);

////////////////////////


const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

////////////////////////
	client.on('message', async msg => {

  let prefix = await db.fetch(`prefix_${msg.guild.id}`) || ayarlar.prefix

	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(prefix)) return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);
	let command = msg.content.toLowerCase().split(' ')[0];
	command = command.slice(prefix.length)

	if (command === '****') {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setColor('RANDOM')
    .setDescription(':warning: | İlk olarak sesli bir kanala giriş yapmanız gerek.'));
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle(':warning: | İlk olarak sesli bir kanala giriş yapmanız gerek.'));
		}
		if (!permissions.has('SPEAK')) {
			 return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setColor('RANDOM')
      .setTitle(':warning: | Şarkı başlatılamıyor. Lütfen mikrofonumu açınız.'));
        }

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			 return msg.channel.sendEmbed(new Discord.RichEmbed)
      .setTitle(`**✅ | Oynatma Listesi: **${playlist.title}** Kuyruğa Eklendi!**`)
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 10);
					let index = 0;
          
				 msg.channel.sendEmbed(new Discord.RichEmbed()                  
         .setTitle('Elvis-Bot | Şarkı Seçimi')
         .setDescription(`${videos.map(video2 => `**${++index} -** ${video2.title}`).join('\n')}`)
         .setFooter('Lütfen 1-10 arasında bir rakam seçiniz 10 saniye içinde liste iptal edilecektir.')
         .setColor('0x36393E'));
          msg.delete(5000)
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						 return msg.channel.sendEmbed(new Discord.RichEmbed()
            .setColor('0x36393E')
            .setDescription(':warning: | **Şarkı Değeri Belirtmediğiniz İçin Seçim İptal Edilmiştir**.'));
                    }
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.sendEmbed(new Discord.RichEmbed()
          .setColor('0x36393E')
          .setDescription(':( | **Aradaım Fakat Hiç Bir Sonuç Çıkmadı**'));
                }
            }
			return handleVideo(video, msg, voiceChannel);
      
		}
	} else if (command === '****') {
		if (!msg.member.voiceChannel) if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(' :warning: | **Lütfen öncelikle sesli bir kanala katılınız**.'));
		if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
     .setColor('RANDOM')
     .setTitle(' :warning: | **Hiç Bir Müzik Çalmamakta**'));                                              
		serverQueue.connection.dispatcher.end('**Müziği Geçtim!**');
		return undefined;
	} else if (command === '****') {
		if (!msg.member.voiceChannel) if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription('**:warning: | Lütfen öncelikle sesli bir kanala katılınız.**'));
		if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
     .setColor('RANDOM')
     .setTitle(':warning: **| Hiç Bir Müzik Çalmamakta**'));                                              
		msg.channel.send(`:stop_button: **${serverQueue.songs[0].title}** Adlı Müzik Durduruldu`);
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('**Müzik Bitti**');
		return undefined;
	} else if (command === '****') {
		if (!msg.member.voiceChannel) if (!msg.member.voiceChannel) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(':warning: **| Lütfen öncelikle sesli bir kanala katılınız.**'));
		if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
     .setColor('RANDOM')
     .setTitle(':warning:| **Hiç Bir Müzik Çalmamakta**'));                                              
		if (!args[1]) return msg.channel.sendEmbed(new Discord.RichEmbed()
   .setTitle(`:warning: Şuanki Ses Seviyesi: **${serverQueue.volume}**`)
    .setColor('RANDOM'))
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
		return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setTitle(`:hammer:  Ses Seviyesi Ayarlanıyor: **${args[1]}**`)
    .setColor('RANDOM'));                             
	} else if (command === '****') {
		if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setTitle(":warning: | **Çalan Müzik Bulunmamakta**")
    .setColor('RANDOM'));
		return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
    .setTitle(" Elvis-Bot | Çalan")                            
    .addField('Başlık', `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`, true)
    .addField("Süre", `${serverQueue.songs[0].durationm}:${serverQueue.songs[0].durations}`, true))
	} else if (command === '****') {
    let index = 0;
		if (!serverQueue) return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setTitle(":warning: | **Sırada Müzik Bulunmamakta**")
    .setColor('RANDOM'));
		  return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setColor('RANDOM')
     .setTitle('Elvis-Bot | Şarkı Kuyruğu')
    .setDescription(`${serverQueue.songs.map(song => `**${++index} -** ${song.title}`).join('\n')}`))
    .addField('Şu anda çalınan: ' + `${serverQueue.songs[0].title}`);
	} else if (command === '****') {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setTitle("**:pause_button: Müzik Senin İçin Durduruldu!**")
      .setColor('RANDOM'));
		}
		return msg.channel.send(':warning: | **Çalan Müzik Bulunmamakta**');
	} else if (command === '****') {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setTitle("**:arrow_forward: Müzik Senin İçin Devam Etmekte!**")
      .setColor('RANDOM'));
		}
		return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setTitle(":warning: ** | Çalan Müzik Bulunmamakta.**")
    .setColor('RANDOM'));
	}
  

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
    const serverQueue = queue.get(msg.guild.id);
    console.log(video);
    const song = {
        id: video.id,
        title: video.title,
        url: `https://www.youtube.com/watch?v=${video.id}`,
    durationh: video.duration.hours,
    durationm: video.duration.minutes,
        durations: video.duration.seconds,
    views: video.views,
    };
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`:warning: **Şarkı Sisteminde Problem Var Hata Nedeni: ${error}**`);
			queue.delete(msg.guild.id);
			return msg.channel.sendEmbed(new Discord.RichEmbed()
      .setTitle(`:warning: **Şarkı Sisteminde Problem Var Hata Nedeni: ${error}**`)
      .setColor('RANDOM'))
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		return msg.channel.sendEmbed(new Discord.RichEmbed()
    .setTitle(`:arrow_heading_up:  **${song.title}** Adlı Müzik Kuyruğa Eklendi!`)
    .setColor('RANDOM'))
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === ' :x:  | **Yayın Akış Hızı Yeterli Değil.**') console.log('Müzik Bitti.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	 serverQueue.textChannel.sendEmbed(new Discord.RichEmbed()                                   
  .setTitle("**Elvis-Bot | 🎙 Müzik Başladı**",`https://cdn.discordapp.com/avatars/473974675194511361/6bb90de9efe9fb80081b185266bb94a6.png?size=2048`)
  .setThumbnail(`https://i.ytimg.com/vi/${song.id}/default.jpg?width=80&height=60`)
  .addField('\nBaşlık', `[${song.title}](${song.url})`, true)
  .addField("\nSes Seviyesi", `${serverQueue.volume}%`, true)
  .addField("Süre", `${song.durationm}:${song.durations}`, true)
  .setColor('RANDOM'));
}
//////////////////
client.elevation = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;

client.on('warn', e => {
  console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
  console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});




/*const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};*/



client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./komutlar/', (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});


client.on("guildCreate", guild => { // when client joins to a guild
  console.log(`Yeni bir sunucuya katıldım!\n  Ad: ${guild.name}\n  ID: ${guild.id}\n\n  Sahibi:\n    Tag: ${guild.owner.user.tag}\n    ID: ${guild.owner.user.id}\n`); // print what the guild is and who owns it
  
    client.user.setStatus("dnd");
   var oyun = [
       `Prefiximi Öğrenmek İçin @Elvis`,
       `Yeni Komut!! --> ?fakemesaj`,
       `Yeni Komut!! --> ?disco-rol-ayarla`,
       `Yeni Komut!! --> ?disco-başlat`,
       `Yeni Komut!! --> ?söv`,
       `Servers: ${client.guilds.size} | Users: ${client.users.size} | ${version}`
    ];

    setInterval(function() {

        var random = Math.floor(Math.random()*(oyun.length-0+1)+0);

        client.user.setGame(oyun[random], "https://twitch.tv/Fredeski27");
        }, 2 * 2500);
  
  
  client.users.get(guild.owner.user.id).send("Botumuzu Eklediğiniz İçin Teşekkür Ederiz İyi Kullanımlar.");
    
  const sunucuekle = new Discord.RichEmbed()
    .setColor(0x43B581)
    .setThumbnail(`${guild.iconURL}`)
    .setFooter(`${ayarlar.footer}`)
    .setAuthor('YENİ BİR SUNUCUYA EKLENDİM!')
    .addField(`Sunucu Adı`, `${guild.name}`)
    .addField(`Sunucu Sahibi`, `${guild.owner}`)
    .addField(`Sunucu ID'si`, `${guild.id}`, true)
    .addField(`Kullanıcı Sayısı`, `${guild.memberCount}`, true)
    .addField(`Kanal Sayısı`, `${guild.channels.size}`, true)
  return client.channels.get("578190107748597760").send(sunucuekle);

});


client.on("guildDelete",  guild => { // when client leaves or deletes a guild
  console.log(`Bir sunucudan ayrıldım!\n  Ad: ${guild.name}\n  ID: ${guild.id}\n\n  Sahibi:\n    Tag: ${guild.owner.user.tag}\n    ID: ${guild.owner.user.id}\n`); // print what the guild was and who owned it
  
    client.user.setStatus("dnd");
   var oyun = [
       `Prefiximi Öğrenmek İçin @Elvis`,
       `Yeni Komut!! --> ?fakemesaj`,
       `Yeni Komut!! --> ?disco-rol-ayarla`,
       `Yeni Komut!! --> ?disco-başlat`,
       `Yeni Komut!! --> ?söv`,
       `Servers: ${client.guilds.size} | Users: ${client.users.size} | ${version}`
    ];

    setInterval(function() {

        var random = Math.floor(Math.random()*(oyun.length-0+1)+0);

        client.user.setGame(oyun[random], "https://twitch.tv/Fredeski27");
        }, 2 * 2500);
  
  
  const sunucucikar = new Discord.RichEmbed()
    .setColor(0xF04747)
    .setThumbnail(`${guild.iconURL}`)
    .setFooter(`${ayarlar.footer}`)
    .setAuthor('BİR SUNUCUDAN ÇIKARILDIM!')
    .addField(`Sunucu Adı`, `${guild.name}`)
    .addField(`Sunucu Sahibi`, `${guild.owner}`)
    .addField(`Sunucu ID'si`, `${guild.id}`, true)
    .addField(`Kullanıcı Sayısı`, `${guild.memberCount}`, true)
    .addField(`Kanal Sayısı`, `${guild.channels.size}`, true)
  return client.channels.get("578190107748597760").send(sunucucikar);

});


client.on("guildMemberAdd", async member => {
  
  let gck = await db.fetch(`gckanal_${member.guild.id}`);
  if (!gck) return;
  const gck1 = member.guild.channels.find('name', gck)
  let username = member.user.username;
  const bg = await Jimp.read("https://cdn.discordapp.com/attachments/518301263000240144/525998913971552257/guildAdd.png");
  const userimg = await Jimp.read(member.user.avatarURL);
  var font;
  if (member.user.tag.length < 15) font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
  else if (member.user.tag.length > 15) font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  else font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  await bg.print(font, 430, 230, member.user.tag);
  await userimg.resize(357, 362);
  await bg.composite(userimg, 48, 26).write("./giris-cikis/AxodeX-hosgeldin.png");
  setTimeout(function () {
    gck1.send(`:inbox_tray: ${member.user} adlı kullanıcı sunucuya katıldı.`)
    gck1.send(new Discord.Attachment("./giris-cikis/AxodeX-hosgeldin.png"));
  }, 1000);
  setTimeout(function () {
    fs.unlink("./giris-cikis/AxodeX-hosgeldin.png");
  }, 10000);
  
  
  let tag = await db.fetch(`stag_${member.guild.id}`);
  let tagsekil;
  if (tag == null) tagsekil = member.setNickname(`${member.user.username}`)
  else tagsekil = member.setNickname(`${tag} ${member.user.username}`)
  
  
})

client.on("guildMemberRemove", async member => {
 
  let gck = await db.fetch(`gckanal_${member.guild.id}`);
  if (!gck) return;
  const gck1 = member.guild.channels.find('name', gck)
  let username = member.user.username;          
  const bg = await Jimp.read("https://cdn.discordapp.com/attachments/518301263000240144/525998919264763914/guildRemove.png");
  const userimg = await Jimp.read(member.user.avatarURL);
  var font;
  if (member.user.tag.length < 15) font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
  else if (member.user.tag.length > 15) font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  else font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
  await bg.print(font, 430, 230, member.user.tag);
  await userimg.resize(357, 362)
  await bg.composite(userimg, 48, 26).write("./giris-cikis/AxodeX-gorusuruz.png");
  setTimeout(function () {
    gck1.send(`:outbox_tray: ${member.user} adlı kullanıcı sunucudan ayrıldı.`)
    gck1.send(new Discord.Attachment("./giris-cikis/AxodeX-gorusuruz.png"));
  }, 1000);
  setTimeout(function () {
    fs.unlink("./giris-cikis/AxodeX-gorusuruz.png");
  }, 10000);
})

/*client.on("guildMemberAdd", async member => {
  let sayac = JSON.parse(fs.readFileSync("./ayarlar/sayac.json", "utf8"));
  const channel = member.guild.channels.find("name", "sayaç")
  const embed = new Discord.RichEmbed()
    .setDescription(`:star: :inbox_tray: **${sayac[member.guild.id].sayi}** kişi olmamıza son **${sayac[member.guild.id].sayi - member.guild.members.size}** kişi kaldı! :star: `)
    .setColor(0xFFFFFF)
    .setFooter(yapimci)
    .setTitle('AxodeX Sayaç')
    channel.send({embed})
});

client.on("guildMemberRemove", async member => {
  let sayac = JSON.parse(fs.readFileSync("./ayarlar/sayac.json", "utf8"));
  const channel = member.guild.channels.find("name", "sayaç")
  const embed = new Discord.RichEmbed()
    .setDescription(`:star: :outbox_tray: **${sayac[member.guild.id].sayi}** kişi olmamıza son **${sayac[member.guild.id].sayi - member.guild.members.size}** kişi kaldı! :star: `)
    .setColor(0xFFFFFF)
    .setFooter(yapimci)
    .setTitle('AxodeX Sayaç')
    channel.send({embed})
});*/

client.on("guildMemberAdd", async member => {
  
  let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal9 = await db.fetch(`sayacK_${member.guild.id}`);
  const sayacmesaj = await db.fetch(`sayacm_${member.guild.id}`)
  if (!skanal9) return;
  const skanal31 = member.guild.channels.find('name', skanal9)
  skanal31.send(`:inbox_tray:  \`${member.user.tag}\` adlı kullanıcı sunucuya katıldı. \`${sayac}\` kullanıcı olmaya \`${sayac - member.guild.members.size}\` kullanıcı kaldı.`)
});

client.on("guildMemberRemove", async member => {
  
  let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal9 = await db.fetch(`sayacK_${member.guild.id}`);
  if (!skanal9) return;
  const skanal31 = member.guild.channels.find('name', skanal9)
  skanal31.send(`:outbox_tray: \`${member.user.tag}\` adlı kullanıcı sunucudan ayrıldı. \`${sayac}\` kullanıcı olmaya \`${sayac - member.guild.members.size}\` kullanıcı kaldı.`)
});


client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e){
      reject(e);
    }
  });
};

client.elevation = message => {
  if(!message.guild) {
	return; }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;

client.on('warn', e => {
  console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
  console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});
 
client.on("message", async msg => {
db.fetch(`reklam_${msg.guild.id}`).then(i => {
if (i == 'Açık') {
        
    const reklam = ["discordapp", ".com", ".net", ".xyz", ".tk", "gulu", ".pw", ".io", ".me", ".gg", "www.", "https", "http", ".gl"];
        if (reklam.some(word => msg.content.includes(word))) {
          try {
             if (!msg.member.hasPermission("BAN_MEMBERS")) {
                  msg.delete();
               
               const reklamEngel = new Discord.RichEmbed()
                    .setDescription(`⚠ Hey ${msg.author.tag}! \`Bu sunucuda ki reklam korumasını ben yapıyorum dostum. Bu sunucuda reklam yapamazsın!\` ⚠`)
                    .setColor(0xffffff)
                  
                  msg.channel.send(reklamEngel).then(msg => msg.delete(10000));
               
             }              
          } catch(err) {
            console.log(err);
          }
        } } else if (i == 'Kapalı') {
 
}
   
})
});


client.on("message", async msg => {
db.fetch(`kufur_${msg.guild.id}`).then(i => {
if (i == 'Açık') {
        const kufur = ["s i k e m","oç","oc","amk","ananı sikiyim","ananıskm","piç","amk", "amsk", "sikim", "sikiyim", "orospu çocuğu", "piç kurusu", "kahpe", "orospu", "mal", "sik", "yarrak", "amcık", "amık", "yarram", "sikimi ye", "mk", "mq", "aq", "ak", "amq",];
        if (kufur.some(word => msg.content.includes(word))) {
          try {
             if (!msg.member.hasPermission("BAN_MEMBERS")) {
                  msg.delete();
               
                  const kufurEngel = new Discord.RichEmbed()
                    .setDescription(`⚠ Hey ${msg.author.tag}! \`Bu sunucuda ki küfür korumasını ben yapıyorum dostum. Bu sunucuda küfür edemezsin!\` ⚠`)
                    .setColor(0xffffff)
                  
                  msg.channel.send(kufurEngel).then(msg => msg.delete(10000));
             }              
          } catch(err) {
            console.log(err);
          }
        } } else if (i == 'Kapalı') {
 
}
   
})
});


client.on('guileemberAdd', (member, guild, message) => {
  db.fetch(`otorolisim_${member.guild.id}`).then(role => {
  db.fetch(`autoRole_${member.guild.id}`).then(otorol => {
  db.fetch(`otorolKanal_${member.guild.id}`).then(i => {  
 if (!otorol || otorol.toLowerCase() === 'sıfırla') return;
else {
 try {
  
  if (!i) return 
  member.addRole(member.guild.roles.get(otorol))
  member.guild.channels.get(i).send(`${member.user.tag}adlı kullancıya ${role} rolü verildi.`).then(m => m.react('518404166662488064'))
} catch (e) {
 console.log(e)
}
}
})
})  
})    
});

client.on("message", async message => {
  
let prefix = await db.fetch(`prefix_${message.guild.id}`) || ayarlar.prefix

    let cont = message.content.slice(prefix.length).split(" ")
    let args = cont.slice(1)
    if (message.content.startsWith(prefix + 'otorol')) {
    let rol = message.mentions.roles.first() || message.guild.roles.get(args.join(' '))
    if (!message.member.hasPermission('MANAGE_ROLES')) return message.channel.send(`<:kapali:523940655890825247> Otorol ayarlamak için \`Rolleri Yönet\` yetkisine sahip olman gerek.`)
    let newRole;
    let tworole;
    if (!rol) return message.channel.send(`<:kapali:523940655890825247> Bir rol etiketlemelisin.`)
    else newRole = message.mentions.roles.first().id
    let isim = message.mentions.roles.first().name  
    let otorolkanal = message.mentions.channels.first();
    if (!otorolkanal) return message.channel.send(`<:kapali:523940655890825247> Bir kanal etiketlemelisin.`)
    db.set(`otorolisim_${message.guild.id}`, isim)
    db.set(`otorolKanal_${message.guild.id}`, message.mentions.channels.first().id).then(i => {
    db.set(`autoRole_${message.guild.id}`, newRole).then(otorol => {
    if (!message.guild.roles.get(newRole)) return message.channel.send(`<:kapali:523940655890825247>  Etiketlediğiniz rol bulunamadı, etiketlediğiniz rolün etiketlenebilirliğinin aktif olduğundan emin olunuz.`)
      message.channel.send(`<:aktif:523940654338932737> Otorol <@&${newRole}>, mesaj kanalı <#${i}> olarak ayarlandı.`)
   
  })  
});        
    }
})


client.on("message", message => {
  const dmchannel = client.channels.find("name", "dm-log");
  if (message.channel.type === "dm") {
      if (message.author.bot) return;
      const dmesajlar = new Discord.RichEmbed()
        .setTitle(`Bota Özelden Bir Mesaj Geldi!`)
        .setColor(0xffffff)
        .addField(`Mesajı Gönderen:`, `${message.author.tag} (${message.author.id})`)
        .addField(`Gelen Mesaj:`, `${message.content}`)
  return client.channels.get("534831431919206405").send(dmesajlar);
  }
});

client.on('message', message => {
 if (message.content.toLowerCase() === "sa") {
    message.reply("Aleyküm Selam, HoşGeldin Bro!")
  }
  if (message.content.toLowerCase().startsWith("selamun aleyküm")) {
    message.reply("Aleyküm Selam, HoşGeldin Bro!") 
    }
});

client.on('message', msg => {
  if (msg.author.bot) return;
  if (msg.content.toLowerCase().includes('günaydın')) msg.reply('sana da günaydın');
  if (msg.content.toLowerCase().includes('herkese günaydın')) msg.reply('günaydın :)');
  if (msg.content.toLowerCase().includes('iyi geceler')) msg.reply('sana da iyi geceler');
  if (msg.content.toLowerCase().includes('iyi akşamlar')) msg.reply('sana da iyi akşamlar');
  if (msg.content.toLowerCase().includes('selamın aleyküm')) msg.reply('aleyküm selam');
  if (msg.content.toLowerCase().includes('güle güle')) msg.reply('sana da güle güle');
  if (msg.content.toLowerCase().includes('eoo')) msg.reply('Neoo!');
  if (msg.content.toLowerCase().includes('seni seviyorum')) msg.reply(':heart: Bende Seni Seviyorum :heart:');
  if (msg.content.toLowerCase().includes('artislik yapma')) msg.reply('Keslan Burda Efendi Benim');  
  if (msg.content.toLowerCase().includes('götü kalkdı botun')) msg.reply('Kankicim Sen Götüne Bak Sonra Konuş');
  if (msg.content.toLowerCase().includes('nasılsın')) msg.reply('İyiyim Sen Nassın');
  if (msg.content.toLowerCase().includes('eyw çoluk çocuk nasıl')) msg.reply('İyi valla seninkiler nasıl :)');
  if (msg.content.toLowerCase().includes('benim çocuğum yok')) msg.reply('Aga Be Yak Yak');
  if (msg.content.toLowerCase().includes('satacam botu')) msg.reply('Sen Sahibini nasıl satıyorsun lan');
  if (msg.content.toLowerCase().includes('burada kral kim')) msg.reply('Burada Kral benim');
});
  


var f = [];
function factorial (n) {
  if (n == 0 || n == 1)
    return 1;
  if (f[n] > 0)
    return f[n];
  return f[n] = factorial(n-1) * n;
};
function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

client.on('message', async msg => {
  

  if(msg.content.startsWith(`<@${client.user.id}>`)) {
    msg.channel.send(`Bu Sunucuda ki Prefixim: ${await db.fetch(`prefix_${msg.guild.id}`) || ayarlar.prefix}`)
  }})





client.on("guildMemberAdd", async member => {
   const fs = require('fs');
    let gkanal = JSON.parse(fs.readFileSync("./ayarlar/glog.json", "utf8"));
    const gözelkanal = member.guild.channels.get(gkanal[member.guild.id].resim)
    if (!gözelkanal) return;
     let username = member.user.username;
        if (gözelkanal === undefined || gözelkanal === null) return;
        if (gözelkanal.type === "text") {
            const bg = await Jimp.read("https://cdn.discordapp.com/attachments/450693709076365323/473184528148725780/guildAdd.png");
            const userimg = await Jimp.read(member.user.avatarURL);
            var font;
            if (member.user.tag.length < 15) font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
            else if (member.user.tag.length > 15) font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
            else font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
            await bg.print(font, 430, 170, member.user.tag);
            await userimg.resize(362, 362);
            await bg.composite(userimg, 43, 26).write("./img/"+ member.id + ".png");
              setTimeout(function () {
                    gözelkanal.send(new Discord.Attachment("./img/" + member.id + ".png"));
              }, 1000);
              setTimeout(function () {
                fs.unlink("./img/" + member.id + ".png");
              }, 10000);
        }
    })

client.on("guildMemberRemove", async member => {
   const fs = require('fs');
    let gkanal = JSON.parse(fs.readFileSync("./ayarlar/glog.json", "utf8"));
    const gözelkanal = member.guild.channels.get(gkanal[member.guild.id].resim)
    if (!gözelkanal) return;
        let username = member.user.username;
        if (gözelkanal === undefined || gözelkanal === null) return;
        if (gözelkanal.type === "text") {            
                        const bg = await Jimp.read("https://cdn.discordapp.com/attachments/450693709076365323/473184546477572107/guildRemove.png");
            const userimg = await Jimp.read(member.user.avatarURL);
            var font;
            if (member.user.tag.length < 15) font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
            else if (member.user.tag.length > 15) font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
            else font = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE);
            await bg.print(font, 430, 170, member.user.tag);
            await userimg.resize(362, 362);
            await bg.composite(userimg, 43, 26).write("./img/"+ member.id + ".png");
              setTimeout(function () {
                    gözelkanal.send(new Discord.Attachment("./img/" + member.id + ".png"));
              }, 1000);
              setTimeout(function () {
                fs.unlink("./img/" + member.id + ".png");
              }, 10000);
        }
    })

client.on('message', async msg => {
  
  let prefix = await db.fetch(`prefix_${msg.guild.id}`) || ayarlar.prefix
  
    if (msg.content.toLowerCase() === prefix + "disko") {
     if (msg.channel.type === "dm") return;
      const rol = 'Disko'
      setInterval(() => {
      msg.guild.roles.find(s => s.name === rol).setColor("RANDOM")
    }, 2000);
  }
});



client.on("mesage", async msg => {
      db.fetch(`disco_${msg.guild.id}`).then(i => {
      if (i == 'Açık') {

			const rol = 'Disco' // Rol ismi buraya
	
			setInterval(() => {
			msg.guild.roles.find(s => s.name === rol)
				.setColor("RANDOM")
			}, 2000);
        
      } (i == 'Kapalı')
   
})
});

client.on("message", async msg => {
  
  if (msg.channel.type === "dm") return;
  if(msg.author.bot) return;  
  
  if (msg.content.length > 7) {
    
    db.add(`puan_${msg.author.id + msg.guild.id}`, 3)
};

  if (db.fetch(`puan_${msg.author.id + msg.guild.id}`) > 150) {
    
    db.add(`seviye_${msg.author.id + msg.guild.id}`, 1)
    
    db.delete(`puan_${msg.author.id + msg.guild.id}`)
    
  };
  
});

///////////////
let points = JSON.parse(fs.readFileSync('./xp.json', 'utf8'));

var f = [];
function factorial (n) {
  if (n == 0 || n == 1)
    return 1;
  if (f[n] > 0)
    return f[n];
  return f[n] = factorial(n-1) * n;
};
function clean(text) {
  if (typeof(text) === "string")
    return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
  else
      return text;
}

client.on("message", async message => {
    if (message.channel.type === "dm") return;

  if (message.author.bot) return;

  var user = message.mentions.users.first() || message.author;
  if (!message.guild) user = message.author;

  if (!points[user.id]) points[user.id] = {
    points: 0,
    level: 0,
  };

  let userData = points[user.id];
  userData.points++;

  let curLevel = Math.floor(0.1 * Math.sqrt(userData.points));
  if (curLevel > userData.level) {
    userData.level = curLevel;
        var user = message.mentions.users.first() || message.author;
message.channel.send(`Elvis-Bot **| ${user.username} Tebrikler! Level atladın**`)
    }

fs.writeFile('./xp.json', JSON.stringify(points), (err) => {
    if (err) console.error(err)
  })
  
  let prefix = await db.fetch(`prefix_${message.guild.id}`) || ayarlar.prefix
  
  if (message.content.toLowerCase() === prefix + 'level' || message.content.toLowerCase() === prefix + 'profil') {
const level = new Discord.RichEmbed().setTitle(`${user.username}`).setDescription(`**Seviye:** ${userData.level}\n**EXP:** ${userData.points}`).setColor("RANDOM").setFooter(``).setThumbnail(user.avatarURL)
message.channel.send(`Elvis-Bot **| ${user.username} Adlı Kullanıcının Profili Burada!**`)
message.channel.send(level)
  }
});
//////////////
client.login(process.env.token);