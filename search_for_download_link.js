const axios = require('axios').default;
const cheerio = require('cheerio');
const search_in_source = require('./search_in_source');
const download = require('./download');

module.exports = async function search_for_download_link(full_name, name, type) {

    try {
        if (type === 'serial') name = full_name[0].name.toLowerCase();
        const page_link = await search_in_source(name, type);
        if (page_link === null) return null;
        const response = await axios.get(page_link);
        let $ = cheerio.load(response.data);
        let links = $("a");
        if (type === 'movie')
            search_movie(full_name, name, $, links);
        else search_serial(full_name, name, $, links)
    } catch (e) {
        console.log('error while search_for_download_link in ' + name);
        return null;
    }
}

function search_movie(full_name, name, $, links) {
    let result = null;
    for (let i = 0, l = links.length; i < l; i++) {
        let downloadLink = $(links[i]).attr("href");
        if (downloadLink !== undefined && downloadLink !== null) {
            let temp = downloadLink;
            downloadLink = downloadLink.toLowerCase();
            let spitted_downloadLink = downloadLink.replace(/[.\-]/g,' ');
            if (spitted_downloadLink.includes(name) && check_download_format(downloadLink)) {
                result = temp;
                break;
            }
        }
    }

    if (result !== null)
        download(full_name, result);
}

function search_serial(serial_series, name, $, links) {
    let result = null;
    let zip_name;
    let season_array = [];
    let counter =0;
   A: for (let i = 0, l = links.length; i < l; i++) {
        let downloadLink = $(links[i]).attr("href");
        if (downloadLink !== undefined && downloadLink !== null) {
            let temp = downloadLink;
            downloadLink = downloadLink.toLowerCase();
            let spitted_downloadLink = downloadLink.replace(/[.\-]/g,' ');
            if (spitted_downloadLink.includes(name) && check_download_format(downloadLink)) {
                for (let j = 0, ll = serial_series.length; j < ll; j++) {
                    let seasonNumber = serial_series[j].season;
                    if (season_array.includes(seasonNumber)) continue;
                    let episodeNumber = serial_series[j].episode;

                    let season_episode = 's' + seasonNumber + 'e' + episodeNumber;
                    if (downloadLink.includes(season_episode)) {
                        result = temp;
                        zip_name = serial_series[j].file_name + '.xxx';
                        download(zip_name, result);
                        counter++;
                        if (counter === ll) break A;
                    } else if ((downloadLink.includes('s' + seasonNumber) && !downloadLink.includes('s' + seasonNumber + 'e')) ||
                        spitted_downloadLink.includes(get_ordinal(parseInt(seasonNumber)) + ' season')) {
                        result = temp;
                        zip_name = name.replace(/\s/g, '.') + '.S' + seasonNumber + '.xxx';
                        download(zip_name, result);
                        season_array.push(seasonNumber);
                        counter++;
                        if (counter === ll) break A;
                    }
                }
            }
        }
    }
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