"use strict";
setErrorMode(RESOURCEERRORMODE_STRICT);

// ----------------------------------------------------------------------------

let scriptConfig = null;

// ----------------------------------------------------------------------------

let errorMessageColour = toColour(237, 67, 55, 255);
let syntaxMessageColour = toColour(200, 200, 200, 255);
let actionColour = toColour(177, 156, 217, 255);

// ----------------------------------------------------------------------------

let localTalkRange = 10;
let localShoutRange = 25;
let localActionRange = 20;

let translateMessage = null;

// ----------------------------------------------------------------------------

bindEventHandler("OnResourceStart", thisResource, function(event, client) {
	let configFile = openFile("config.json");
	if(configFile == null) {
		console.log("[Chat] Could not load config.json. Resource stopping ...");
		thisResource.stop();
		return false;
	}
	
	scriptConfig = JSON.parse(configFile.readBytes(configFile.length));
	configFile.close();
	if(!scriptConfig) {
		console.log("[Chat] Could not load config.json. Resource stopping ...");
		thisResource.stop();
		return false;
	}
	
	if(!findResourceByName("v-translate").isStarted) {
		scriptConfig.translateMessages = false;
		console.log("[Chat] Translate is enabled in resource config, but the translate resource isn't loaded!");
		console.log("[Chat] This resource will NOT auto translate messages!");
		console.log("[Chat] Please start the v-translate resource.");
	} else {
		console.log("[Chat] The v-translate resource is already running.");
		console.log("[Chat] Messages will be auto-translated!");
	}
	
	if(!findResourceByName("v-discord").isStarted) {
		scriptConfig.discordEcho = false;
		console.log("[Chat] Discord echo is enabled in resource config, but the discord resource isn't loaded!");
		console.log("[Chat] This resource will NOT bridge messages with discord!");
		console.log("[Chat] Please start the v-discord resource.");
	} else {
		console.log("[Chat] The v-discord resource is already running.");
		console.log("[Chat] Messages will be bridged with discord!");
	}	
	
	console.log("[Chat] Resource started! (Translation " + String((scriptConfig.translateMessages) ? "enabled" : "disabled") + ", Emoji " + String((scriptConfig.enableEmoji) ? "enabled" : "disabled") + ")");
});

// ----------------------------------------------------------------------------

addEventHandler("OnResourceStop", function(event, resource) {
	if(resource == findResourceByName("v-translate")) {
		scriptConfig.translateMessages = false;
		console.log("[Chat] The v-translate resource has been stopped!");
		console.log("[Chat] This resource will stop auto translating messages!");
	}
});

// ----------------------------------------------------------------------------

addEventHandler("OnResourceStart", function(event, resource) {
	if(resource == findResourceByName("v-translate")) {
		console.log("[Chat] The v-translate resource has been started!");
		console.log("[Chat] Please enable /autotranslate to translate messages!");
	}
});

// ----------------------------------------------------------------------------

let emojiReplaceString = [
	[":hash:", "#"],
	[":zero:", "0"],
	[":one:", "1"],
	[":two:", "2"],
	[":three:", "3"],
	[":four:", "4"],
	[":five:", "5"],
	[":six:", "6"],
	[":seven:", "7"],
	[":eight:", "8"],
	[":nine:", "9"],
	[":copyright:", "©"],
	[":registered:", "®"],
	[":bangbang:", "‼"],
	[":interrobang:", "⁉"],
	[":tm:", "™"],
	[":information_source:", "ℹ"],
	[":left_right_arrow:", "↔"],
	[":arrow_up_down:", "↕"],
	[":arrow_upper_left:", "↖"],
	[":arrow_upper_right:", "↗"],
	[":arrow_lower_right:", "↘"],
	[":arrow_lower_left:", "↙"],
	[":leftwards_arrow_with_hook:", "↩"],
	[":arrow_right_hook:", "↪"],
	[":watch:", "⌚"],
	[":hourglass:", "⌛"],
	[":fast_forward:", "⏩"],
	[":rewind:", "⏪"],
	[":arrow_double_up:", "⏫"],
	[":arrow_double_down:", "⏬"],
	[":alarm_clock:", "⏰"],
	[":hourglass_flowing_sand:", "⏳"],
	[":m:", "ⓜ"],
	[":black_small_square:", "▪"],
	[":white_small_square:", "▫"],
	[":arrow_forward:", "▶"],
	[":arrow_backward:", "◀"],
	[":white_medium_square:", "◻"],
	[":black_medium_square:", "◼"],
	[":white_medium_small_square:", "◽"],
	[":black_medium_small_square:", "◾"],
	[":sunny:", "☀"],
	[":cloud:", "☁"],
	[":telephone:", "☎"],
	[":ballot_box_with_check:", "☑"],
	[":umbrella:", "☔"],
	[":coffee:", "☕"],
	[":point_up:", "☝"],
	[":relaxed:", "☺"],
	[":aries:", "♈"],
	[":taurus:", "♉"],
	[":gemini:", "♊"],
	[":cancer:", "♋"],
	[":leo:", "♌"],
	[":virgo:", "♍"],
	[":libra:", "♎"],
	[":scorpius:", "♏"],
	[":sagittarius:", "♐"],
	[":capricorn:", "♑"],
	[":aquarius:", "♒"],
	[":pisces:", "♓"],
	[":spades:", "♠"],
	[":clubs:", "♣"],
	[":hearts:", "♥"],
	[":diamonds:", "♦"],
	[":hotsprings:", "♨"],
	[":recycle:", "♻"],
	[":wheelchair:", "♿"],
	[":anchor:", "⚓"],
	[":warning:", "⚠"],
	[":zap:", "⚡"],
	[":white_circle:", "⚪"],
	[":black_circle:", "⚫"],
	[":soccer:", "⚽"],
	[":baseball:", "⚾"],
	[":snowman:", "⛄"],
	[":partly_sunny:", "⛅"],
	[":ophiuchus:", "⛎"],
	[":no_entry:", "⛔"],
	[":church:", "⛪"],
	[":fountain:", "⛲"],
	[":golf:", "⛳"],
	[":sailboat:", "⛵"],
	[":tent:", "⛺"],
	[":fuelpump:", "⛽"],
	[":scissors:", "✂"],
	[":white_check_mark:", "✅"],
	[":airplane:", "✈"],
	[":envelope:", "✉"],
	[":fist:", "✊"],
	[":raised_hand:", "✋"],
	[":v:", "✌"],
	[":pencil2:", "✏"],
	[":black_nib:", "✒"],
	[":heavy_check_mark:", "✔"],
	[":heavy_multiplication_x:", "✖"],
	[":sparkles:", "✨"],
	[":eight_spoked_asterisk:", "✳"],
	[":eight_pointed_black_star:", "✴"],
	[":snowflake:", "❄"],
	[":sparkle:", "❇"],
	[":x:", "❌"],
	[":negative_squared_cross_mark:", "❎"],
	[":question:", "❓"],
	[":grey_question:", "❔"],
	[":grey_exclamation:", "❕"],
	[":exclamation:", "❗"],
	[":heart:", "❤"],
	[":heavy_plus_sign:", "➕"],
	[":heavy_minus_sign:", "➖"],
	[":heavy_division_sign:", "➗"],
	[":arrow_right:", "➡"],
	[":curly_loop:", "➰"],
	[":arrow_heading_up:", "⤴"],
	[":arrow_heading_down:", "⤵"],
	[":arrow_left:", "⬅"],
	[":arrow_up:", "⬆"],
	[":arrow_down:", "⬇"],
	[":black_large_square:", "⬛"],
	[":white_large_square:", "⬜"],
	[":star:", "⭐"],
	[":o:", "⭕"],
	[":wavy_dash:", "〰"],
	[":part_alternation_mark:", "〽"],
	[":congratulations:", "㊗"],
	[":secret:", "㊙"],
	[":mahjong:", "🀄"],
	[":black_joker:", "🃏"],
	[":a:", "🅰"],
	[":b:", "🅱"],
	[":o2:", "🅾"],
	[":parking:", "🅿"],
	[":ab:", "🆎"],
	[":cl:", "🆑"],
	[":cool:", "🆒"],
	[":free:", "🆓"],
	[":id:", "🆔"],
	[":new:", "🆕"],
	[":ng:", "🆖"],
	[":ok:", "🆗"],
	[":sos:", "🆘"],
	[":up:", "🆙"],
	[":vs:", "🆚"],
	[":cn:", "🇨 🇳"],
	[":de:", "🇩 🇪"],
	[":es:", "🇪 🇸"],
	[":fr:", "🇫 🇷"],
	[":uk:", "🇬 🇧"],
	[":it:", "🇮 🇹"],
	[":jp:", "🇯 🇵"],
	[":kr:", "🇰 🇷"],
	[":ru:", "🇷 🇺"],
	[":us:", "🇺 🇸"],
	[":koko:", "🈁"],
	[":sa:", "🈂"],
	[":u7121:", "🈚"],
	[":u6307:", "🈯"],
	[":u7981:", "🈲"],
	[":u7a7a:", "🈳"],
	[":u5408:", "🈴"],
	[":u6e80:", "🈵"],
	[":u6709:", "🈶"],
	[":u6708:", "🈷"],
	[":u7533:", "🈸"],
	[":u5272:", "🈹"],
	[":u55b6:", "🈺"],
	[":ideograph_advantage:", "🉐"],
	[":accept:", "🉑"],
	[":cyclone:", "🌀"],
	[":foggy:", "🌁"],
	[":closed_umbrella:", "🌂"],
	[":night_with_stars:", "🌃"],
	[":sunrise_over_mountains:", "🌄"],
	[":sunrise:", "🌅"],
	[":city_sunset:", "🌆"],
	[":city_sunrise:", "🌇"],
	[":rainbow:", "🌈"],
	[":bridge_at_night:", "🌉"],
	[":ocean:", "🌊"],
	[":volcano:", "🌋"],
	[":milky_way:", "🌌"],
	[":earth_asia:", "🌏"],
	[":new_moon:", "🌑"],
	[":first_quarter_moon:", "🌓"],
	[":waxing_gibbous_moon:", "🌔"],
	[":full_moon:", "🌕"],
	[":crescent_moon:", "🌙"],
	[":first_quarter_moon_with_face:", "🌛"],
	[":star2:", "🌟"],
	[":stars:", "🌠"],
	[":chestnut:", "🌰"],
	[":seedling:", "🌱"],
	[":palm_tree:", "🌴"],
	[":cactus:", "🌵"],
	[":tulip:", "🌷"],
	[":cherry_blossom:", "🌸"],
	[":rose:", "🌹"],
	[":hibiscus:", "🌺"],
	[":sunflower:", "🌻"],
	[":blossom:", "🌼"],
	[":corn:", "🌽"],
	[":ear_of_rice:", "🌾"],
	[":herb:", "🌿"],
	[":four_leaf_clover:", "🍀"],
	[":maple_leaf:", "🍁"],
	[":fallen_leaf:", "🍂"],
	[":leaves:", "🍃"],
	[":mushroom:", "🍄"],
	[":tomato:", "🍅"],
	[":eggplant:", "🍆"],
	[":grapes:", "🍇"],
	[":melon:", "🍈"],
	[":watermelon:", "🍉"],
	[":tangerine:", "🍊"],
	[":banana:", "🍌"],
	[":pineapple:", "🍍"],
	[":apple:", "🍎"],
	[":green_apple:", "🍏"],
	[":peach:", "🍑"],
	[":cherries:", "🍒"],
	[":strawberry:", "🍓"],
	[":hamburger:", "🍔"],
	[":pizza:", "🍕"],
	[":meat_on_bone:", "🍖"],
	[":poultry_leg:", "🍗"],
	[":rice_cracker:", "🍘"],
	[":rice_ball:", "🍙"],
	[":rice:", "🍚"],
	[":curry:", "🍛"],
	[":ramen:", "🍜"],
	[":spaghetti:", "🍝"],
	[":bread:", "🍞"],
	[":fries:", "🍟"],
	[":sweet_potato:", "🍠"],
	[":dango:", "🍡"],
	[":oden:", "🍢"],
	[":sushi:", "🍣"],
	[":fried_shrimp:", "🍤"],
	[":fish_cake:", "🍥"],
	[":icecream:", "🍦"],
	[":shaved_ice:", "🍧"],
	[":ice_cream:", "🍨"],
	[":doughnut:", "🍩"],
	[":cookie:", "🍪"],
	[":chocolate_bar:", "🍫"],
	[":candy:", "🍬"],
	[":lollipop:", "🍭"],
	[":custard:", "🍮"],
	[":honey_pot:", "🍯"],
	[":cake:", "🍰"],
	[":bento:", "🍱"],
	[":stew:", "🍲"],
	[":egg:", "🍳"],
	[":fork_and_knife:", "🍴"],
	[":tea:", "🍵"],
	[":sake:", "🍶"],
	[":wine_glass:", "🍷"],
	[":cocktail:", "🍸"],
	[":tropical_drink:", "🍹"],
	[":beer:", "🍺"],
	[":beers:", "🍻"],
	[":ribbon:", "🎀"],
	[":gift:", "🎁"],
	[":birthday:", "🎂"],
	[":jack_o_lantern:", "🎃"],
	[":christmas_tree:", "🎄"],
	[":santa:", "🎅"],
	[":fireworks:", "🎆"],
	[":sparkler:", "🎇"],
	[":balloon:", "🎈"],
	[":tada:", "🎉"],
	[":confetti_ball:", "🎊"],
	[":tanabata_tree:", "🎋"],
	[":crossed_flags:", "🎌"],
	[":bamboo:", "🎍"],
	[":dolls:", "🎎"],
	[":flags:", "🎏"],
	[":wind_chime:", "🎐"],
	[":rice_scene:", "🎑"],
	[":school_satchel:", "🎒"],
	[":mortar_board:", "🎓"],
	[":carousel_horse:", "🎠"],
	[":ferris_wheel:", "🎡"],
	[":roller_coaster:", "🎢"],
	[":fishing_pole_and_fish:", "🎣"],
	[":microphone:", "🎤"],
	[":movie_camera:", "🎥"],
	[":cinema:", "🎦"],
	[":headphones:", "🎧"],
	[":art:", "🎨"],
	[":tophat:", "🎩"],
	[":circus_tent:", "🎪"],
	[":ticket:", "🎫"],
	[":clapper:", "🎬"],
	[":performing_arts:", "🎭"],
	[":video_game:", "🎮"],
	[":dart:", "🎯"],
	[":slot_machine:", "🎰"],
	[":_8ball:", "🎱"],
	[":game_die:", "🎲"],
	[":bowling:", "🎳"],
	[":flower_playing_cards:", "🎴"],
	[":musical_note:", "🎵"],
	[":notes:", "🎶"],
	[":saxophone:", "🎷"],
	[":guitar:", "🎸"],
	[":musical_keyboard:", "🎹"],
	[":trumpet:", "🎺"],
	[":violin:", "🎻"],
	[":musical_score:", "🎼"],
	[":running_shirt_with_sash:", "🎽"],
	[":tennis:", "🎾"],
	[":ski:", "🎿"],
	[":basketball:", "🏀"],
	[":checkered_flag:", "🏁"],
	[":snowboarder:", "🏂"],
	[":runner:", "🏃"],
	[":surfer:", "🏄"],
	[":trophy:", "🏆"],
	[":football:", "🏈"],
	[":swimmer:", "🏊"],
	[":house:", "🏠"],
	[":house_with_garden:", "🏡"],
	[":office:", "🏢"],
	[":post_office:", "🏣"],
	[":hospital:", "🏥"],
	[":bank:", "🏦"],
	[":atm:", "🏧"],
	[":hotel:", "🏨"],
	[":love_hotel:", "🏩"],
	[":convenience_store:", "🏪"],
	[":school:", "🏫"],
	[":department_store:", "🏬"],
	[":factory:", "🏭"],
	[":izakaya_lantern:", "🏮"],
	[":japanese_castle:", "🏯"],
	[":european_castle:", "🏰"],
	[":snail:", "🐌"],
	[":snake:", "🐍"],
	[":racehorse:", "🐎"],
	[":sheep:", "🐑"],
	[":monkey:", "🐒"],
	[":chicken:", "🐔"],
	[":boar:", "🐗"],
	[":elephant:", "🐘"],
	[":octopus:", "🐙"],
	[":shell:", "🐚"],
	[":bug:", "🐛"],
	[":ant:", "🐜"],
	[":bee:", "🐝"],
	[":beetle:", "🐞"],
	[":fish:", "🐟"],
	[":tropical_fish:", "🐠"],
	[":blowfish:", "🐡"],
	[":turtle:", "🐢"],
	[":hatching_chick:", "🐣"],
	[":baby_chick:", "🐤"],
	[":hatched_chick:", "🐥"],
	[":bird:", "🐦"],
	[":penguin:", "🐧"],
	[":koala:", "🐨"],
	[":poodle:", "🐩"],
	[":camel:", "🐫"],
	[":dolphin:", "🐬"],
	[":mouse:", "🐭"],
	[":cow:", "🐮"],
	[":tiger:", "🐯"],
	[":rabbit:", "🐰"],
	[":cat:", "🐱"],
	[":dragon_face:", "🐲"],
	[":whale:", "🐳"],
	[":horse:", "🐴"],
	[":monkey_face:", "🐵"],
	[":dog:", "🐶"],
	[":pig:", "🐷"],
	[":frog:", "🐸"],
	[":hamster:", "🐹"],
	[":wolf:", "🐺"],
	[":bear:", "🐻"],
	[":panda_face:", "🐼"],
	[":pig_nose:", "🐽"],
	[":feet:", "🐾"],
	[":eyes:", "👀"],
	[":ear:", "👂"],
	[":nose:", "👃"],
	[":lips:", "👄"],
	[":tongue:", "👅"],
	[":point_up_2:", "👆"],
	[":point_down:", "👇"],
	[":point_left:", "👈"],
	[":point_right:", "👉"],
	[":punch:", "👊"],
	[":wave:", "👋"],
	[":ok_hand:", "👌"],
	[":thumbsup:", "👍"],
	[":thumbsdown:", "👎"],
	[":clap:", "👏"],
	[":open_hands:", "👐"],
	[":crown:", "👑"],
	[":womans_hat:", "👒"],
	[":eyeglasses:", "👓"],
	[":necktie:", "👔"],
	[":shirt:", "👕"],
	[":jeans:", "👖"],
	[":dress:", "👗"],
	[":kimono:", "👘"],
	[":bikini:", "👙"],
	[":womans_clothes:", "👚"],
	[":purse:", "👛"],
	[":handbag:", "👜"],
	[":pouch:", "👝"],
	[":mans_shoe:", "👞"],
	[":athletic_shoe:", "👟"],
	[":high_heel:", "👠"],
	[":sandal:", "👡"],
	[":boot:", "👢"],
	[":footprints:", "👣"],
	[":bust_in_silhouette:", "👤"],
	[":boy:", "👦"],
	[":girl:", "👧"],
	[":man:", "👨"],
	[":woman:", "👩"],
	[":family:", "👪"],
	[":couple:", "👫"],
	[":cop:", "👮"],
	[":dancers:", "👯"],
	[":bride_with_veil:", "👰"],
	[":person_with_blond_hair:", "👱"],
	[":man_with_gua_pi_mao:", "👲"],
	[":man_with_turban:", "👳"],
	[":older_man:", "👴"],
	[":older_woman:", "👵"],
	[":baby:", "👶"],
	[":construction_worker:", "👷"],
	[":princess:", "👸"],
	[":japanese_ogre:", "👹"],
	[":japanese_goblin:", "👺"],
	[":ghost:", "👻"],
	[":angel:", "👼"],
	[":alien:", "👽"],
	[":space_invader:", "👾"],
	[":robot_face:", "🤖"],
	[":imp:", "👿"],
	[":skull:", "💀"],
	[":information_desk_person:", "💁"],
	[":guardsman:", "💂"],
	[":dancer:", "💃"],
	[":lipstick:", "💄"],
	[":nail_care:", "💅"],
	[":massage:", "💆"],
	[":haircut:", "💇"],
	[":barber:", "💈"],
	[":syringe:", "💉"],
	[":pill:", "💊"],
	[":kiss:", "💋"],
	[":love_letter:", "💌"],
	[":ring:", "💍"],
	[":gem:", "💎"],
	[":couplekiss:", "💏"],
	[":bouquet:", "💐"],
	[":couple_with_heart:", "💑"],
	[":wedding:", "💒"],
	[":heartbeat:", "💓"],
	[":broken_heart:", "💔"],
	[":two_hearts:", "💕"],
	[":sparkling_heart:", "💖"],
	[":heartpulse:", "💗"],
	[":cupid:", "💘"],
	[":blue_heart:", "💙"],
	[":green_heart:", "💚"],
	[":yellow_heart:", "💛"],
	[":purple_heart:", "💜"],
	[":gift_heart:", "💝"],
	[":revolving_hearts:", "💞"],
	[":heart_decoration:", "💟"],
	[":diamond_shape_with_a_dot_inside:", "💠"],
	[":bulb:", "💡"],
	[":anger:", "💢"],
	[":bomb:", "💣"],
	[":zzz:", "💤"],
	[":boom:", "💥"],
	[":sweat_drops:", "💦"],
	[":droplet:", "💧"],
	[":dash:", "💨"],
	[":poop:", "💩"],
	[":muscle:", "💪"],
	[":dizzy:", "💫"],
	[":speech_balloon:", "💬"],
	[":white_flower:", "💮"],
	[":_100:", "💯"],
	[":moneybag:", "💰"],
	[":currency_exchange:", "💱"],
	[":heavy_dollar_sign:", "💲"],
	[":credit_card:", "💳"],
	[":yen:", "💴"],
	[":dollar:", "💵"],
	[":money_with_wings:", "💸"],
	[":chart:", "💹"],
	[":seat:", "💺"],
	[":computer:", "💻"],
	[":briefcase:", "💼"],
	[":minidisc:", "💽"],
	[":floppy_disk:", "💾"],
	[":cd:", "💿"],
	[":dvd:", "📀"],
	[":file_folder:", "📁"],
	[":open_file_folder:", "📂"],
	[":page_with_curl:", "📃"],
	[":page_facing_up:", "📄"],
	[":date:", "📅"],
	[":calendar:", "📆"],
	[":card_index:", "📇"],
	[":chart_with_upwards_trend:", "📈"],
	[":chart_with_downwards_trend:", "📉"],
	[":bar_chart:", "📊"],
	[":clipboard:", "📋"],
	[":pushpin:", "📌"],
	[":round_pushpin:", "📍"],
	[":paperclip:", "📎"],
	[":straight_ruler:", "📏"],
	[":triangular_ruler:", "📐"],
	[":bookmark_tabs:", "📑"],
	[":ledger:", "📒"],
	[":notebook:", "📓"],
	[":notebook_with_decorative_cover:", "📔"],
	[":closed_book:", "📕"],
	[":book:", "📖"],
	[":green_book:", "📗"],
	[":blue_book:", "📘"],
	[":orange_book:", "📙"],
	[":books:", "📚"],
	[":name_badge:", "📛"],
	[":scroll:", "📜"],
	[":pencil:", "📝"],
	[":telephone_receiver:", "📞"],
	[":pager:", "📟"],
	[":fax:", "📠"],
	[":satellite:", "📡"],
	[":loudspeaker:", "📢"],
	[":mega:", "📣"],
	[":outbox_tray:", "📤"],
	[":inbox_tray:", "📥"],
	[":package:", "📦"],
	[":e_mail:", "📧"],
	[":incoming_envelope:", "📨"],
	[":envelope_with_arrow:", "📩"],
	[":mailbox_closed:", "📪"],
	[":mailbox:", "📫"],
	[":postbox:", "📮"],
	[":newspaper:", "📰"],
	[":iphone:", "📱"],
	[":calling:", "📲"],
	[":vibration_mode:", "📳"],
	[":mobile_phone_off:", "📴"],
	[":signal_strength:", "📶"],
	[":camera:", "📷"],
	[":video_camera:", "📹"],
	[":tv:", "📺"],
	[":radio:", "📻"],
	[":vhs:", "📼"],
	[":arrows_clockwise:", "🔃"],
	[":loud_sound:", "🔊"],
	[":battery:", "🔋"],
	[":electric_plug:", "🔌"],
	[":mag:", "🔍"],
	[":mag_right:", "🔎"],
	[":lock_with_ink_pen:", "🔏"],
	[":closed_lock_with_key:", "🔐"],
	[":key:", "🔑"],
	[":lock:", "🔒"],
	[":unlock:", "🔓"],
	[":bell:", "🔔"],
	[":bookmark:", "🔖"],
	[":link:", "🔗"],
	[":radio_button:", "🔘"],
	[":back:", "🔙"],
	[":end:", "🔚"],
	[":on:", "🔛"],
	[":soon:", "🔜"],
	[":top:", "🔝"],
	[":underage:", "🔞"],
	[":keycap_ten:", "🔟"],
	[":capital_abcd:", "🔠"],
	[":abcd:", "🔡"],
	[":_1234:", "🔢"],
	[":symbols:", "🔣"],
	[":abc:", "🔤"],
	[":fire:", "🔥"],
	[":flashlight:", "🔦"],
	[":wrench:", "🔧"],
	[":hammer:", "🔨"],
	[":nut_and_bolt:", "🔩"],
	[":knife:", "🔪"],
	[":gun:", "🔫"],
	[":crystal_ball:", "🔮"],
	[":six_pointed_star:", "🔯"],
	[":beginner:", "🔰"],
	[":trident:", "🔱"],
	[":black_square_button:", "🔲"],
	[":white_square_button:", "🔳"],
	[":red_circle:", "🔴"],
	[":large_blue_circle:", "🔵"],
	[":large_orange_diamond:", "🔶"],
	[":large_blue_diamond:", "🔷"],
	[":small_orange_diamond:", "🔸"],
	[":small_blue_diamond:", "🔹"],
	[":small_red_triangle:", "🔺"],
	[":small_red_triangle_down:", "🔻"],
	[":arrow_up_small:", "🔼"],
	[":arrow_down_small:", "🔽"],
	[":clock1:", "🕐"],
	[":clock2:", "🕑"],
	[":clock3:", "🕒"],
	[":clock4:", "🕓"],
	[":clock5:", "🕔"],
	[":clock6:", "🕕"],
	[":clock7:", "🕖"],
	[":clock8:", "🕗"],
	[":clock9:", "🕘"],
	[":clock10:", "🕙"],
	[":clock11:", "🕚"],
	[":clock12:", "🕛"],
	[":mount_fuji:", "🗻"],
	[":tokyo_tower:", "🗼"],
	[":statue_of_liberty:", "🗽"],
	[":japan:", "🗾"],
	[":moyai:", "🗿"],
	[":grin:", "😁"],
	[":joy:", "😂"],
	[":smiley:", "😃"],
	[":smile:", "😄"],
	[":sweat_smile:", "😅"],
	[":laughing:", "😆"],
	[":wink:", "😉"],
	[":blush:", "😊"],
	[":yum:", "😋"],
	[":relieved:", "😌"],
	[":heart_eyes:", "😍"],
	[":smirk:", "😏"],
	[":unamused:", "😒"],
	[":sweat:", "😓"],
	[":pensive:", "😔"],
	[":confounded:", "😖"],
	[":kissing_heart:", "😘"],
	[":kissing_closed_eyes:", "😚"],
	[":stuck_out_tongue_winking_eye:", "😜"],
	[":stuck_out_tongue_closed_eyes:", "😝"],
	[":disappointed:", "😞"],
	[":angry:", "😠"],
	[":rage:", "😡"],
	[":cry:", "😢"],
	[":persevere:", "😣"],
	[":triumph:", "😤"],
	[":disappointed_relieved:", "😥"],
	[":fearful:", "😨"],
	[":weary:", "😩"],
	[":sleepy:", "😪"],
	[":tired_face:", "😫"],
	[":sob:", "😭"],
	[":cold_sweat:", "😰"],
	[":scream:", "😱"],
	[":astonished:", "😲"],
	[":flushed:", "😳"],
	[":dizzy_face:", "😵"],
	[":mask:", "😷"],
	[":smile_cat:", "😸"],
	[":joy_cat:", "😹"],
	[":smiley_cat:", "😺"],
	[":heart_eyes_cat:", "😻"],
	[":smirk_cat:", "😼"],
	[":kissing_cat:", "😽"],
	[":pouting_cat:", "😾"],
	[":crying_cat_face:", "😿"],
	[":scream_cat:", "🙀"],
	[":no_good:", "🙅"],
	[":ok_woman:", "🙆"],
	[":bow:", "🙇"],
	[":see_no_evil:", "🙈"],
	[":hear_no_evil:", "🙉"],
	[":speak_no_evil:", "🙊"],
	[":raising_hand:", "🙋"],
	[":raised_hands:", "🙌"],
	[":person_frowning:", "🙍"],
	[":person_with_pouting_face:", "🙎"],
	[":pray:", "🙏"],
	[":rocket:", "🚀"],
	[":railway_car:", "🚃"],
	[":bullettrain_side:", "🚄"],
	[":bullettrain_front:", "🚅"],
	[":metro:", "🚇"],
	[":station:", "🚉"],
	[":bus:", "🚌"],
	[":busstop:", "🚏"],
	[":ambulance:", "🚑"],
	[":fire_engine:", "🚒"],
	[":police_car:", "🚓"],
	[":taxi:", "🚕"],
	[":red_car:", "🚗"],
	[":blue_car:", "🚙"],
	[":truck:", "🚚"],
	[":ship:", "🚢"],
	[":speedboat:", "🚤"],
	[":traffic_light:", "🚥"],
	[":construction:", "🚧"],
	[":rotating_light:", "🚨"],
	[":triangular_flag_on_post:", "🚩"],
	[":door:", "🚪"],
	[":no_entry_sign:", "🚫"],
	[":smoking:", "🚬"],
	[":no_smoking:", "🚭"],
	[":bike:", "🚲"],
	[":walking:", "🚶"],
	[":mens:", "🚹"],
	[":womens:", "🚺"],
	[":restroom:", "🚻"],
	[":baby_symbol:", "🚼"],
	[":toilet:", "🚽"],
	[":wc:", "🚾"],
	[":bath:", "🛀"],
	[":articulated_lorry:", "🚛"],
	[":kissing_smiling_eyes:", "😙"],
	[":pear:", "🍐"],
	[":bicyclist:", "🚴"],
	[":rabbit2:", "🐇"],
	[":clock830:", "🕣"],
	[":train:", "🚋"],
	[":oncoming_automobile:", "🚘"],
	[":expressionless:", "😑"],
	[":smiling_imp:", "😈"],
	[":frowning:", "😦"],
	[":no_mouth:", "😶"],
	[":baby_bottle:", "🍼"],
	[":non_potable_water:", "🚱"],
	[":open_mouth:", "😮"],
	[":last_quarter_moon_with_face:", "🌜"],
	[":do_not_litter:", "🚯"],
	[":sunglasses:", "😎"],
	[":loop:", "➿"],
	[":last_quarter_moon:", "🌗"],
	[":grinning:", "😀"],
	[":euro:", "💶"],
	[":clock330:", "🕞"],
	[":telescope:", "🔭"],
	[":globe_with_meridians:", "🌐"],
	[":postal_horn:", "📯"],
	[":stuck_out_tongue:", "😛"],
	[":clock1030:", "🕥"],
	[":pound:", "💷"],
	[":two_men_holding_hands:", "👬"],
	[":tiger2:", "🐅"],
	[":anguished:", "😧"],
	[":vertical_traffic_light:", "🚦"],
	[":confused:", "😕"],
	[":repeat:", "🔁"],
	[":oncoming_police_car:", "🚔"],
	[":tram:", "🚊"],
	[":dragon:", "🐉"],
	[":earth_americas:", "🌎"],
	[":rugby_football:", "🏉"],
	[":left_luggage:", "🛅"],
	[":sound:", "🔉"],
	[":clock630:", "🕡"],
	[":dromedary_camel:", "🐪"],
	[":oncoming_bus:", "🚍"],
	[":horse_racing:", "🏇"],
	[":rooster:", "🐓"],
	[":rowboat:", "🚣"],
	[":customs:", "🛃"],
	[":repeat_one:", "🔂"],
	[":waxing_crescent_moon:", "🌒"],
	[":mountain_railway:", "🚞"],
	[":clock930:", "🕤"],
	[":put_litter_in_its_place:", "🚮"],
	[":arrows_counterclockwise:", "🔄"],
	[":clock130:", "🕜"],
	[":goat:", "🐐"],
	[":pig2:", "🐖"],
	[":innocent:", "😇"],
	[":no_bicycles:", "🚳"],
	[":light_rail:", "🚈"],
	[":whale2:", "🐋"],
	[":train2:", "🚆"],
	[":earth_africa:", "🌍"],
	[":shower:", "🚿"],
	[":waning_gibbous_moon:", "🌖"],
	[":steam_locomotive:", "🚂"],
	[":cat2:", "🐈"],
	[":tractor:", "🚜"],
	[":thought_balloon:", "💭"],
	[":two_women_holding_hands:", "👭"],
	[":full_moon_with_face:", "🌝"],
	[":mouse2:", "🐁"],
	[":clock430:", "🕟"],
	[":worried:", "😟"],
	[":rat:", "🐀"],
	[":ram:", "🐏"],
	[":dog2:", "🐕"],
	[":kissing:", "😗"],
	[":helicopter:", "🚁"],
	[":clock1130:", "🕦"],
	[":no_mobile_phones:", "📵"],
	[":european_post_office:", "🏤"],
	[":ox:", "🐂"],
	[":mountain_cableway:", "🚠"],
	[":sleeping:", "😴"],
	[":cow2:", "🐄"],
	[":minibus:", "🚐"],
	[":clock730:", "🕢"],
	[":aerial_tramway:", "🚡"],
	[":speaker:", "🔈"],
	[":no_bell:", "🔕"],
	[":mailbox_with_mail:", "📬"],
	[":no_pedestrians:", "🚷"],
	[":microscope:", "🔬"],
	[":bathtub:", "🛁"],
	[":suspension_railway:", "🚟"],
	[":crocodile:", "🐊"],
	[":mountain_bicyclist:", "🚵"],
	[":waning_crescent_moon:", "🌘"],
	[":monorail:", "🚝"],
	[":children_crossing:", "🚸"],
	[":clock230:", "🕝"],
	[":busts_in_silhouette:", "👥"],
	[":mailbox_with_no_mail:", "📭"],
	[":leopard:", "🐆"],
	[":deciduous_tree:", "🌳"],
	[":oncoming_taxi:", "🚖"],
	[":lemon:", "🍋"],
	[":mute:", "🔇"],
	[":baggage_claim:", "🛄"],
	[":twisted_rightwards_arrows:", "🔀"],
	[":sun_with_face:", "🌞"],
	[":trolleybus:", "🚎"],
	[":evergreen_tree:", "🌲"],
	[":passport_control:", "🛂"],
	[":new_moon_with_face:", "🌚"],
	[":potable_water:", "🚰"],
	[":high_brightness:", "🔆"],
	[":low_brightness:", "🔅"],
	[":clock530:", "🕠"],
	[":hushed:", "😯"],
	[":grimacing:", "😬"],
	[":water_buffalo:", "🐃"],
	[":neutral_face:", "😐"],
	[":clock1230:", "🕧"],
	[":P", "😛" ],	
	[":)", "🙂" ],
	[":D", "😃" ],
	[":o", "😮" ],
	[":O", "😮" ],
	[":(", "☹️" ],
	[":|", "😐" ],
];

// ----------------------------------------------------------------------------

addCommandHandler("autotranslate", function(cmdName, params, client) {
	if(client.administrator) {
		if(scriptConfig.translateMessages) {
			message("[SERVER]: Auto-translate has been turned OFF", COLOUR_YELLOW);
			scriptConfig.translateMessages = false;
		} else {
			message("[SERVER]: Auto-translate has been turned ON", COLOUR_YELLOW);
			scriptConfig.translateMessages = true;
		}
	}
});

// ----------------------------------------------------------------------------

addCommandHandler("autoemoji", function(cmdName, params, client) {
	if(client.administrator) {
		if(scriptConfig.enableEmoji) {
			message("[SERVER]: Emoji has been turned OFF", COLOUR_YELLOW);
			scriptConfig.enableEmoji = false;
		} else {
			message("[SERVER]: Emoji has been turned ON", COLOUR_YELLOW);
			scriptConfig.enableEmoji = true;
		}
	}
});

// ----------------------------------------------------------------------------

addCommandHandler("forcelang", function(cmdName, params, client) {
	if(client.administrator) {
		let splitParams = params.split(" ");
		let clientParam = splitParams[0];
		let langParam = splitParams[1];
		
		let targetClient = getClientFromParams(clientParam);
		let languageId = getLanguageIdFromParams(params);

		if(!targetClient) {
			messageClient("That player was not found!", client, errorMessageColour);
			return false;
		}
		
		if(!languageId) {
			messageClient("That language was not found!", client, errorMessageColour);
			return false;
		}
		
		let tempLanguageId = targetClient.getData("v.translate");
		targetClient.setData("v.translate", languageId);
		setPlayerLanguage(targetClient.name, languageId);	
		
		let outputString = "Your language has been set to " + translationLanguages[languageId][0];			
		let translateTo = findResourceByName("v-translate").exports.getLanguageIdFromParams("English");
		outputString = findResourceByName("v-translate").exports.translateMessage(outputString, translateFrom, translateTo);
		messageClient(outputString, targetClient, COLOUR_YELLOW);

		messageClient("[SERVER]: " + client.name + "'s language has been set to " + translationLanguages[languageId][0], client, COLOUR_YELLOW);		
	}
});

// ----------------------------------------------------------------------------

addCommandHandler("me", function(cmdName, params, client) {
	let clients = findResourceByName("v-sandbox").getExport("getSpawnedClients")(client);
	
	let translateFrom = client.getData("v.translate");
	
	for(let i in clients) {
		let clientMessage = params;		
		if(scriptConfig.translateMessages && findResourceByName("v-translate").isStarted) {
			let translateTo = clients[i].getData("v.translate");
			if(translateTo != translateFrom) {
				clientMessage = findResourceByName("v-translate").exports.translateMessage(clientMessage, translateFrom, translateTo);
			}
		}
		messageClient(client.name + " " + clientMessage, clients[i], toColour(177, 156, 217, 255));	
	}
});

// ----------------------------------------------------------------------------

addCommandHandler("lme", function(cmdName, params, client) {
	let getPlayersInRange = findResourceByName("v-sandbox").getExport("getPlayersInRange");
	
	let clients = getPlayersInRange(client.player.position, localActionRange);
	
	let translateFrom = client.getData("v.translate");
	
	for(let i in clients) {
		let clientMessage = params;		
		if(scriptConfig.translateMessages && findResourceByName("v-translate").isStarted) {
			let translateTo = clients[i].getData("v.translate");
			if(translateTo != translateFrom) {
				clientMessage = findResourceByName("v-translate").exports.translateMessage(clientMessage, translateFrom, translateTo);
			}
		}
		messageClient(client.name + " " + clientMessage, clients[i], toColour(177, 156, 217, 255));	
	}	
});

// ----------------------------------------------------------------------------

addCommandHandler("l", function(cmdName, params, client) {
	let getPlayersInRange = findResourceByName("v-sandbox").getExport("getPlayersInRange");
	
	let clients = getPlayersInRange(client.player.position, localTalkRange);
	
	let translateFrom = client.getData("v.translate");
	
	for(let i in clients) {
		let clientMessage = params;		
		if(scriptConfig.translateMessages && findResourceByName("v-translate").isStarted) {
			let translateTo = clients[i].getData("v.translate");
			if(translateTo != translateFrom) {
				clientMessage = findResourceByName("v-translate").exports.translateMessage(clientMessage, translateFrom, translateTo);
			}				
		}
		messageClient(client.name + "[#CCCCCC] says: [#FFFFFF]" + clientMessage, clients[i], toColour(177, 156, 217, 255));	
	}
});

// ----------------------------------------------------------------------------

addCommandHandler("s", function(cmdName, params, client) {
	let getPlayersInRange = findResourceByName("v-sandbox").getExport("getPlayersInRange");
	let clients = getPlayersInRange(client.player.position, localShoutRange);
	
	let translateFrom = client.getData("v.translate");
	
	for(let i in clients) {
		let clientMessage = params;		
		if(scriptConfig.translateMessages && findResourceByName("v-translate").isStarted) {
			let translateTo = clients[i].getData("v.translate");
			if(translateTo != translateFrom) {
				clientMessage = findResourceByName("v-translate").exports.translateMessage(clientMessage, translateFrom, translateTo);
			}				
		}
		messageClient(client.name + "[#CCCCCC] shouts: [#FFFFFF]" + clientMessage, clients[i], toColour(177, 156, 217, 255));		
	}
});

// ----------------------------------------------------------------------------

addEventHandler("OnPlayerChat", function(event, client, messageText) {
	//Make sure the default chat doesn't show up (this resource customizes chat messages!)
	event.preventDefault();
	
	let colour = COLOUR_WHITE;
	if(client.getData("v.colour") != null) {
		colour = client.getData("v.colour");
	}
	
	let clients = getClients();
	let translateFrom = client.getData("v.translate") || 28;
	
	for(let i in clients) {
		let clientMessage = messageText;
		if(scriptConfig.translateMessages && findResourceByName("v-translate").isStarted) {
			let translateTo = clients[i].getData("v.translate");
			if(translateTo != translateFrom) {
				clientMessage = findResourceByName("v-translate").exports.translateMessage(clientMessage, translateFrom, translateTo);
				console.log(clientMessage);
			}
		}
		
		if(scriptConfig.enableEmoji) {
			clientMessage = replaceEmojiInString(clientMessage);
		}
		
		messageClient(String(client.name + ": [#FFFFFF]" + clientMessage), clients[i], colour);
	}
	
	if(scriptConfig.discordEcho) {
		let discordMessage = messageText;
		let translateTo = findResourceByName("v-translate").exports.getLanguageIdFromParams("English");
		if(scriptConfig.translateMessages && translateFrom != 28) {
			discordMessage = discordMessage + "(" + findResourceByName("v-translate").exports.translateMessage(discordMessage, translateFrom, translateTo) + ")";
		}
		findResourceByName("v-discord").exports.messageDiscord(client.name, discordMessage);
	}
});

// ----------------------------------------------------------------------------

function replaceEmojiInString(messageText) {
	for(let i in emojiReplaceString) {
		messageText = messageText.replace(String(emojiReplaceString[i][0]), emojiReplaceString[i][1]);
	}
	return messageText;
}

// ----------------------------------------------------------------------------

String.prototype.format = function() {
	let a = this;
	for(let k in arguments) {
		a = a.replace("{" + k + "}", arguments[k]);
	}
	return a;
}

// ----------------------------------------------------------------------------

function decodeHTMLEntities(str) {
	if(str && typeof str === 'string') {
		str = escape(str).replace(/%26/g,'&').replace(/%23/g,'#').replace(/%3B/g,';').replace("&#39;","'");
	}
	return unescape(str);
}

// ----------------------------------------------------------------------------

function isPlayerLaughing(messageText) {
	let containsLol = (messageText.toLowerCase().indexOf("lol") != -1);
	let containsJa = (messageText.toLowerCase().indexOf("ja") != -1);
	let containsHa = (messageText.toLowerCase().indexOf("ha") != -1);
	let containsSpaces = (messageText.toLowerCase().indexOf(" ") != -1);
	
	if(containsLol || containsJa || containsHa) {
		if(!containsSpaces) {
			return true;
		}
	}
	
	return false;
}

// ----------------------------------------------------------------------------

function getClientFromParams(params) {
	if(typeof server == "undefined") {
		let clients = getClients();
		for(let i in clients) {
			if(clients[i].name.toLowerCase().indexOf(params.toLowerCase()) != -1) {
				return clients[i];
			}
		}
	} else {
		let clients = getClients();
		if(isNaN(params)) {
			for(let i in clients) {
				if(clients[i].name.toLowerCase().indexOf(params.toLowerCase()) != -1) {
					return clients[i];
				}			
			}
		} else {
			let clientID = Number(params) || 0;
			if(typeof clients[clientID] != "undefined") {
				return clients[clientID];
			}			
		}
	}
	
	return false;
}