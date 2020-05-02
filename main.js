const fs = require('fs');
const search_for_download_link = require('./search_for_download_link');
main();


async function main() {
    let dirs = fs.readdirSync('./');
    let {movies, serials} = split_video_serial(dirs);

    movies = filter_movies(movies,dirs);
    let movies_names = get_movie_names(movies);

    for (let i = 0; i < movies.length; i++) {
        let movie_name = movies_names[i].toLowerCase();
        search_for_download_link(movies[i],movie_name, 'movie')
    }

    let serials_objs = get_serial_name_with_se(serials);
    serials_objs = filter_serials(serials_objs,dirs);
    serials_objs = group_serials(serials_objs,'name')

    for (let i = 0; i < serials_objs.length; i++) {
       search_for_download_link(serials_objs[i],"",'serial')
    }
}

function split_video_serial(dirs) {
    let movie = [], serial = [];
    for (const index in dirs) {
        let name = dirs[index];
        try {
            let temp = name.split('.');
            let file_format = temp[temp.length - 1];
            if (file_format === 'mkv' || file_format === 'avi' ||
                file_format === 'flv' || file_format === 'wmv' ||
                file_format === 'mov' || file_format === 'mp4')
                if (fs.lstatSync(`./${name}`).isFile()) {
                    if (/(s\d\de\d\d)/g.test(name.toLowerCase())) serial.push(name);
                    else movie.push(name);
                }
        } catch (e) {}
    }
    return {serials: serial, movies: movie};
}

function get_movie_names(names) {
   return names.map((name)=>{
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
    return  names.map((name)=>{
        let find_season_episode = /(s\d\de\d\d)/g.exec(name.toLowerCase());
        let serialName = name.slice(0, find_season_episode.index - 1).replace(/[.\\_]/g, ' ');
        let season = find_season_episode[0].slice(1, 3);
        let episode = find_season_episode[0].slice(4);
        return{file_name:name , name:serialName , season : season ,episode :episode};
    });
}

function group_serials(array, key) {
    let values = [];
    let temp = array.reduce((total, current_Obj) => {
        const value = current_Obj[key];
        if (!values.includes(value)) values.push(value);
        total[value] = (total[value] || []).concat(current_Obj);
        return total;
    }, {});
    let result = [];
    for (let i = 0, l = values.length; i < l; i++) {
        result.push(temp[values[i]]);
    }
    return result;
}

function filter_serials(serials_objs, dirs) {
    let result = [];
    for (let i = 0, l = serials_objs.length; i < l; i++) {
        let case1 = serials_objs[i].file_name.split('.');
        let file_format = case1[case1.length - 1];
        case1 = case1.join('.').replace('.'+file_format,'');
        let case2 = serials_objs[i].name.replace(/\s/g, '.').toLowerCase() + '.S' + serials_objs[i].season;
        if (!dirs.includes(case1 + '.zip') && !dirs.includes(case1 + '.srt') &&
            !dirs.includes(case2 + '.zip') && !dirs.includes(case2 + '.srt'))
            result.push(serials_objs[i]);
    }
    console.log(result)
    return result;
}

function filter_movies(movies, dirs) {
    let result = [];
    for (let i = 0, l = movies.length; i < l; i++) {
        let case1 = movies[i].split('.');
        let file_format = case1[case1.length - 1];
        case1 = case1.join('.').replace('.'+file_format,'');
        if (!dirs.includes(case1 + '.zip') && !dirs.includes(case1 + '.srt'))
            result.push(movies[i]);
    }
    console.log(result);
    return result;
}
