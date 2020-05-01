const fs = require('fs');
const search_for_download_link = require('./search_for_download_link');
main();


async function main() {
    let test1 = [
        'the.flash.s06e17.720p.hdtv.hevc.x265.rmteam',
        'The.Big.Bang.Theory.S03E18.720p.BluRay.x264',
        'The.Vampire.Diaries.S04E10.720p.BluRay.x265.10bit.2CH._ClubFilm.IR',
        'The_Mentalist_S05E04_720p_Farsi_Dubbed_(DibaMovie)',
        'Amazing.Stories.S01E02.480p.SUBFA.Film2Movie_li',
        'Swamp.Thing.S01E02.720p.WEB-DL.x265.HEVC.Film2Movie_WS',
        'The.Boys.S01E04.720p.WEB-DL.x265.HEVC.Film2Movie_WS'
    ];
    let test2 = [
            'Resistance.2020.480p.BluRay.SUBFA.Film2Movie_li.mkv',
            'Shanghai.Fortress.2019.480p.BluRay.SUBFA.Film2Movie_li.mkv',
            'Kalashnikov.2020.720p.BluRay.SUBFA.Film2Movie_li.mkv',
            'It.Chapter.Two.2019.480p.BluRay.SUBFA.NEW.Film2Movie_li.mkv',
            'Beauty.and.the.Beast.2017.720p.BluRay.Film2Movie_WS.mkv',
            'Black.Mass.2015.720p.BluRay.Film2Movie_INFO.mkv',
            'Bloodshot.2020.720p.WEB-DL.MkvHub.Film2Media.mkv',
            'Braveheart.1995.mkv',
            'Bridge.Of.Spies.2015.720p.BluRay.mkv'
        ];

    // let {video, serial} = split_video_serial();

    console.log(get_video_names(test2));
    let temp = get_video_names(test2);
    for (let i = 0; i < temp.length; i++) {
        let name = temp[i].toLowerCase();
        search_for_download_link(test2[i],name, 'movie')
    }

    console.log(get_serial_name_with_se(test1));
    test1 = get_serial_name_with_se(test1);
    for (let i = 0; i < test1.length; i++) {
        let download_page = await search_in_source(test1[i].name.toLowerCase(), 'serial')
        console.log("result : "+download_page);
    }

}

function split_video_serial() {
    let dirs = fs.readdirSync('./');
    let video = [], serial = [];
    for (const index in dirs) {
        let name = dirs[index];
        try {
            if (fs.lstatSync(`./${name}`).isFile()) {
                if (name.toLowerCase().exec(/(s\d\de\d\d)/g)) serial.push(name);
                else video.push(name);
            }
        } catch (e) {}
    }
    return {serial: serial, video: video};
}

function get_video_names(names) {
   return names.map((name,index)=>{
       name = name.split('.');
       let temp = [];
       for (const index in name) {
           temp.push(name[index]);
            if ( !isNaN(name[index]) && parseInt(name[index])>100) break;
       }
       return temp.join(" ");
    });
}

function get_serial_name_with_se(names) {
  return   names.map((name)=>{
        let find_season_episode = /(s\d\de\d\d)/g.exec(name.toLowerCase());
        let serialName = name.slice(0, find_season_episode.index - 1).replace(/_/g, ' ').replace(/\./g, ' ');
        let season = find_season_episode[0].slice(1, 3);
        let episode = find_season_episode[0].slice(4);
        return{name:serialName , season : season ,episode :episode};
    });
}