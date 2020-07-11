const axios = require('axios').default;
const cheerio = require('cheerio');
const search_in_source = require('./search_in_source');
const download = require('./download');

module.exports = async function search_for_download_link(full_name, name, type) {

    try {
        if (type === 'serial') name = full_name[0].name.toLowerCase();
        const spitted_name = name.split(" ");
        const year = spitted_name[spitted_name.length - 1];
        if (!isNaN(year)) {
            spitted_name.pop();
            name = spitted_name.join(' ');
        }
        const page_link = await search_in_source(spitted_name, type);
        if (page_link === null) return null;
        const response = await axios.get(page_link);
        let $ = cheerio.load(response.data);
        let links = $("a");
        if (type === 'movie')
            search_movie(full_name, spitted_name, $, links);
        else search_serial(full_name, name, $, links)
    } catch (e) {
        console.log('error while search_for_download_link in ' + name);
        console.log(e);
        return null;
    }
}

function search_movie(full_name, spitted_name, $, links) {
    for (let i = 0, l = links.length; i < l; i++) {
        let downloadLink = $(links[i]).attr("href");
        if (downloadLink === undefined || downloadLink === null) continue;
        let normal_downloadLink = downloadLink;
        downloadLink = downloadLink.toLowerCase();
        if (check_name(downloadLink, spitted_name) && check_download_format(downloadLink)) {
            let spitted_full_name = full_name.split('.');
            spitted_full_name.pop();
            spitted_full_name = spitted_full_name.join('.');
            download(spitted_full_name, normal_downloadLink);
            break;
        }
    }
}

function search_serial(serial_series, name, $, links) {
    let zip_name;
    let season_array = [];
    let counter = 0;
    A: for (let i = 0, links_length = links.length; i < links_length; i++) {
        let downloadLink = $(links[i]).attr("href");
        if (downloadLink === undefined || downloadLink === null) continue;
        let normal_downloadLink = downloadLink;
        downloadLink = downloadLink.toLowerCase();
        let spitted_downloadLink = downloadLink.replace(/[.\-]/g, ' ');
        if (spitted_downloadLink.includes(name) && check_download_format(downloadLink)) {
            for (let j = 0, serial_series_length = serial_series.length; j < serial_series_length; j++) {
                let seasonNumber = serial_series[j].season;
                if (season_array.includes(seasonNumber)) continue;
                let episodeNumber = serial_series[j].episode;

                let season_episode = 's' + seasonNumber + 'e' + episodeNumber;
                if (downloadLink.includes(season_episode)) {
                    zip_name = serial_series[j].file_name;
                    download(zip_name, normal_downloadLink);
                    counter++;
                    if (counter === serial_series_length) break A;
                } else if ((downloadLink.includes('s' + seasonNumber) && !downloadLink.includes('s' + seasonNumber + 'e')) ||
                    spitted_downloadLink.includes(get_ordinal(parseInt(seasonNumber)) + ' season')) {
                    zip_name = name.replace(/\s/g, '.') + '.S' + seasonNumber;
                    download(zip_name, normal_downloadLink);
                    season_array.push(seasonNumber);
                    counter++;
                    if (counter === serial_series_length) break A;
                }
            }
        }
    }
}

function check_name(downloadLink, spitted_name) {
    for (let i = 0, l = spitted_name.length; i < l; i++) {
        if (!downloadLink.includes(spitted_name[i]) && !downloadLink.includes(spitted_name[i] + 's')) {
            return false;
        }
    }
    return true;
}

function get_ordinal(number) {
    let array = ['zeroth', 'first', 'second',
        'third', 'fourth', 'fifth', 'sixth',
        'seventh', 'eighth', 'ninth', 'tenth',
        'eleventh', 'twelfth', 'thirteenth',
        'fourteenth', 'fifteenth', 'sixteenth',
        'seventeenth', 'eighteenth', 'nineteenth'];
    return array[number];
}

function check_download_format(downloadLink) {
    return (downloadLink.includes('.rar') || downloadLink.includes('.zip') ||
        downloadLink.includes('.txt') || downloadLink.includes('.srt'));
}