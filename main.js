const fs = require('fs');
const search_for_download_link = require('./search_for_download_link');
main();


async function main() {
    let dirs = fs.readdirSync('./');
    let {movies, serials} = split_video_serial(dirs);

    movies = filter_movies(movies, dirs);
    let movies_names = get_movie_names(movies);

    for (let i = 0; i < movies.length; i++) {
        let movie_name = movies_names[i].toLowerCase();
        if (i !== 0 && i % 4 === 0) await search_for_download_link(movies[i], movie_name, 'movie');
        else search_for_download_link(movies[i], movie_name, 'movie');
    }

    let serials_objs = get_serial_info(serials);
    serials_objs = filter_serials(serials_objs, dirs);
    serials_objs = group_serials(serials_objs, 'name')

    for (let i = 0; i < serials_objs.length; i++) {
        if (i !== 0 && i % 4 === 0) await search_for_download_link(serials_objs[i], "", 'serial');
        else search_for_download_link(serials_objs[i], "", 'serial');
    }
}

function split_video_serial(dirs) {
    let movie = [], serial = [];
    for (let i = 0, l = dirs.length; i < l; i++) {
        let name = dirs[i];
        try {
            let temp = name.split('.');
            let file_format = temp[temp.length - 1];
            if (check_video_format(file_format))
                if (fs.lstatSync(`./${name}`).isFile()) {
                    if (/(s\d\de\d\d)/g.test(name.toLowerCase())) serial.push(name);
                    else movie.push(name);
                }
        } catch (e) {}
    }

    return {serials: serial, movies: movie};
}

function filter_movies(movies, dirs) {
    let result = [];
    for (let i = 0, l = movies.length; i < l; i++) {

        let pattern = movies[i].split('.');
        pattern.pop();
        pattern = pattern.join('.');
        if (!check_subtitle_exist(dirs,pattern))
            result.push(movies[i]);
    }
    console.log(result);
    return result;
}

function get_movie_names(names) {
    return names.map((name) => {
        name = name.split('.');
        let temp = [];
        for (let i = 0, l = name.length; i < l; i++) {
            temp.push(name[i]);
            if (!isNaN(name[i]) && parseInt(name[i]) > 100) break;
        }
        return temp.join(" ");
    });
}

function get_serial_info(names) {
    return names.map((name) => {
        let find_season_episode = /(s\d\de\d\d)/g.exec(name.toLowerCase());
        let serialName = name.slice(0, find_season_episode.index - 1).replace(/[.\\_]/g, ' ');
        let season = find_season_episode[0].slice(1, 3);
        let episode = find_season_episode[0].slice(4);
        return {file_name: name, name: serialName, season: season, episode: episode};
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
        let pattern1 = serials_objs[i].file_name.split('.');
        pattern1.pop();
        pattern1 = pattern1.join('.') // subtitle per episode

        let serial_name = serials_objs[i].name;
        const spitted_name = serial_name.split(" ");
        const year = spitted_name[spitted_name.length - 1];
        if (!isNaN(year)) {
            spitted_name.pop();
            serial_name = spitted_name.join(' ');
        } // subtitle per season
        let pattern2 = serial_name.replace(/\s/g, '.').toLowerCase() + '.S' + serials_objs[i].season;

        if (!dirs.includes(pattern1 + '.zip') && !dirs.includes(pattern1 + '.srt') &&
            !dirs.includes(pattern2 + '.zip') && !dirs.includes(pattern2 + '.srt'))
            result.push(serials_objs[i]);
    }
    console.log(result)
    return result;
}

function check_video_format(inputFormat) {
    let formats = ['mkv', 'avi', 'flv', 'wmv', 'mov', 'mp4']

    for (let i = 0, l = formats.length; i < l; i++) {
        if (inputFormat === formats[i])
            return true;
    }
    return false
}

function check_subtitle_exist(dirs,pattern) {
    let formats = ['.zip', '.rar', '.srt', '.txt']

    for (let i = 0, l = formats.length; i < l; i++) {
        if (dirs.includes(pattern + formats[i]))
            return true;
    }
    return false
}
