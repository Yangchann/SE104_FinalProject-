// your-script.js

document.addEventListener("DOMContentLoaded", function () {
    var username = localStorage.getItem("username");
    fetchownPlaylists(username);
    fetchRecentlyPlaylists(username);
    fetchUserInfo(username);
    controlSeekBar();
    controlVolume()

});

current_playlists = []
all_playlists = []
current_index = 0
// playlist_name_clicked = ""
var audioPlayer = new Audio()

function fetchownPlaylists(username) {
    // Gửi yêu cầu GET tới endpoint của server
    // var username = document.getElementById("userImage").getAttribute("title")
    fetch(`http://127.0.0.1:8001/playlists/take_owned_playlists/${username}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Lấy container của playlists
        all_playlists = data;
        console.log(all_playlists);

        const playlistContainer = document.getElementById('myPlaylistContainer');

        // Loop through the data and create playlist items
        for (const key in data) {
            // console.log(key, data[key]);
            // Create the content for each playlist item

            const imageUrl = data[key]["imageUrl"]
            const title = data[key]["title"]
            console.log(imageUrl)
            console.log(title)

            const playlistItem = document.createElement('li');
            playlistItem.className = 'Item';
            playlistItem.innerHTML = `
                <div class="img_play" data-playlist-id="${key}">
                    <img src="${imageUrl}" alt="alan">
                    <i id="playbtn" class="bi playListPlay bi-play-circle-fill"></i>
                    <div class="dots" id="dotContainer" onclick="toggleOptions(event)"></div>
                    <div class="options" id="options" onclick="handleOptionsClick(event)">
                        <div class="option" onclick="deletePlaylist(event)">Delete Playlist</div>
                    </div>
                </div>
                <h5>${title}</h5>`;
            // Append the playlist item to the container
            playlistContainer.appendChild(playlistItem);
        }

        const playButtons = document.querySelectorAll('#myPlaylistContainer .bi.playListPlay');
        playButtons.forEach(button => {
            button.addEventListener('click', function () {
                const playlist_name_clicked = button.closest('li').querySelector('h5').textContent;
                console.log(playlist_name_clicked);
                const playPauseBtn = document.getElementById('playPauseBtn');
                playPauseBtn.classList.remove("bi-play-circle-fill");
                playPauseBtn.classList.add("bi-pause-circle-fill");
                
                console.log(all_playlists[playlist_name_clicked]);
                document.getElementById('CurrentPlaylistImage').src = all_playlists[playlist_name_clicked]["imageUrl"];
                
                document.querySelector('.music-control-bar').style.display = 'flex';

                fetchSongsfromPlaylist(playlist_name_clicked)
                    .then(song_list => {
                        console.log(song_list);
                        current_index = 0;
                        document.getElementById('CurrentSongTitle').textContent = song_list[current_index];

                        playPlaylistSongs(playlist_name_clicked,song_list);
                    })
                    .catch(error => {
                        console.error('Error fetching songs:', error);
                    });
            });
        });
    });
}



function fetchRecentlyPlaylists(username) {
    // Gửi yêu cầu GET tới endpoint của server
    // var username = document.getElementById("userImage").getAttribute("title")
    fetch(`http://127.0.0.1:8001/playlists/take_recently_playlists/${username}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
        // Lấy container của playlists
        const playlistContainer = document.getElementById('myRecentlyPlaylistContainter');

        // Loop through the data and create playlist items
        for (const key in data) {
            // console.log(key, data[key]);
            // Create the content for each playlist item

            const imageUrl = data[key]["imageUrl"]
            const title = data[key]["title"]
            console.log(imageUrl)
            console.log(title)

            const playlistItem = document.createElement('li', className='Item');
            playlistItem.innerHTML = `
                <div class="img_play">
                    <img src="${imageUrl}" alt="alan">
                    <i id="playbtn" class="bi playListPlay bi-play-circle-fill"></i>
                    <div class="dots" id="dotContainer" onclick="toggleOptions()"><i class="bi bi-three-dots-vertical"></i></div>
                    <div class="options" id="options">
                        <div class="option" onclick="addPlaylist()">Add Playlist</div>
                        <div class="option" onclick="deletePlaylist()">Delete Playlist</div>
                    </div>
                </div>
                <h5>${title}
                    <br>
                    <div class="subtitle">Subtitle</div>

                </h5>
            `;

            // Append the playlist item to the container
            playlistContainer.appendChild(playlistItem);
                
            }
        }
    )}



function fetchSongsfromPlaylist(playlist_name) {
    return fetch(`http://127.0.0.1:8001/playlists/take_songs_list/${playlist_name}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            return data; // Return the data from the fetch
        });
}



    
function fetchUserInfo(username){
    // Request

    fetch(`http://127.0.0.1:8001/take_user_infor/${username}`)
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();

    })
    .then(data => {
        
        console.log(data);

        // take data from fetch
        var avatarPath = data["avatar_path"];
        var firstName = data["first_name"];
        var lastName = data["last_name"];

        var userImage = document.getElementById('userImage');
        var userImage_1 = document.getElementById('userImage_1');
        var usernameElemet = document.getElementById('username');

        userImage.src = avatarPath
        userImage_1.src = avatarPath
        usernameElemet.textContent = firstName + " " + lastName


    })

}


function playPlaylistSongs(playlist_name_clicked, playlistData) {
    const baseAudioPath = `audio/${playlist_name_clicked}`.replace(/\/$/, "");
    const songs = playlistData.map(song => `${baseAudioPath}/${song}.mp3`);
    current_playlists = songs;

    // Set the current song title with a tooltip
    const currentSongTitleElem = document.getElementById('CurrentSongTitle');
    const tooltipContent = current_playlists[current_index];
    const fileName = getFileName(tooltipContent);
    currentSongTitleElem.textContent = truncateSongName(fileName);
    currentSongTitleElem.title = fileName;

    audioPlayer.playbackRate = 4.0 || 1.0;

    audioPlayer.src = songs[current_index];
    audioPlayer.play();

    audioPlayer.addEventListener('ended', function () {
        current_index++;

        if (current_index < songs.length) {
            audioPlayer.src = songs[current_index];
            const nextFileName = getFileName(songs[current_index]);
            document.getElementById('CurrentSongTitle').textContent = truncateSongName(nextFileName);

            audioPlayer.play();
        } else {
            const playlistNames = Object.keys(all_playlists);
            const currentIndexInNames = playlistNames.indexOf(playlist_name_clicked);

            if (currentIndexInNames < playlistNames.length - 1) {
                const nextPlaylistName = playlistNames[currentIndexInNames + 1];
                document.getElementById('CurrentSongTitle').textContent = nextPlaylistName;
                document.getElementById('CurrentPlaylistImage').src = all_playlists[nextPlaylistName]["imageUrl"];
                current_index = 0;

                fetchSongsfromPlaylist(nextPlaylistName)
                    .then(song_list => {
                        playPlaylistSongs(nextPlaylistName, song_list);
                    })
                    .catch(error => {
                        console.error('Error fetching songs:', error);
                    });
            } else {
                console.log('All playlists ended');
            }
        }

        // Set the current song title with a tooltip
        const tooltipContent = current_playlists[current_index];
        const fileName = getFileName(tooltipContent);
        currentSongTitleElem.textContent = truncateSongName(fileName);
        currentSongTitleElem.title = fileName;
    });

    // Function to truncate long song names
    function truncateSongName(songName) {
        const maxLength = 25; 
        if (songName.length > maxLength) {
            return songName.substring(0, maxLength - 3) + '...';
        }
        return songName;
    }

    function getFileName(path) {
        const fileNameWithExtension = path.split('/').pop();
        return fileNameWithExtension.replace('.mp3', '');
    }
}




// ----------------------------------------------------------------
// Controler bar

function pause() {
    const playPauseBtn = document.getElementById('playPauseBtn');

    if (audioPlayer.paused) {
        audioPlayer.play();
        console.log('Paused');
        playPauseBtn.classList.remove("bi-play-circle-fill");
        playPauseBtn.classList.add("bi-pause-circle-fill");
    }
    else {
        audioPlayer.pause();
        console.log("Play")
        playPauseBtn.classList.remove("bi-pause-circle-fill");
        playPauseBtn.classList.add("bi-play-circle-fill");
    }
}


function nextsong() {
    current_index++;
    audioPlayer.pause();

    if (current_index < current_playlists.length) {
        audioPlayer.src = current_playlists[current_index];
        document.getElementById('CurrentSongTitle').textContent = getSongNameFromPath(current_playlists[current_index]);

        audioPlayer.play();
    } else {
        console.log('Playlist ended');
        showNotification('End of playlist');
        current_index = 0; // Reset to the beginning
    }
}

function previoussong() {
    current_index--;

    if (current_index >= 0 && current_index < current_playlists.length) {
        console.log(current_playlists[current_index]);
        audioPlayer.pause();
        audioPlayer.src = current_playlists[current_index];
        document.getElementById('CurrentSongTitle').textContent = getSongNameFromPath(current_playlists[current_index]);

        audioPlayer.play();
    } else {
        console.log('No previous song available');
        showNotification('No previous song');
        current_index = 0; // Reset to the beginning
    }
}

function showNotification(message, type = 'info') {
    toastr.options = {
        "positionClass": "toast-bottom-right",
        "preventDuplicates": true,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "closeButton": true
    };

    toastr[type](message);
}


function getSongNameFromPath(audioPath) {
    var pathSegments = audioPath.split('/');

    var fileName = pathSegments[pathSegments.length - 1];

    var nameSegments = fileName.split('.');

    var songName = nameSegments[0];

    songName = songName.replace(/_/g, ' ');

    return songName;
}


function controlSeekBar() {
    const seekBar = document.getElementById('seekBar');
    const playedColor = '#3bdcd2'; 
    const remainingColor = '#ccc';  

    audioPlayer.addEventListener('timeupdate', function () {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;

        const progress = (currentTime / duration) * 100;

        seekBar.value = progress;

        seekBar.style.background = `linear-gradient(90deg, ${playedColor} ${progress}%, ${remainingColor} ${progress}%, ${remainingColor} ${100 - progress}%)`;
    });

    seekBar.addEventListener('input', function () {
        const seekPosition = (seekBar.value / 100) * audioPlayer.duration;
        audioPlayer.currentTime = seekPosition;
    });

    seekBar.addEventListener('mousedown', function () {
        audioPlayer.pause(); 
    });

    seekBar.addEventListener('mouseup', function () {
        audioPlayer.play();
    });
}



function controlVolume() {
    const volumeBar = document.getElementById('volumeBar');
    const volumeIcon = document.getElementById('volumeIcon');
    const mutedColor = '#3bdcd2';

    // Set the initial background color
    volumeBar.style.background = `linear-gradient(90deg, ${mutedColor} ${volumeBar.value}%, transparent ${volumeBar.value}%)`;

    audioPlayer.addEventListener('volumechange', function () {
        const volume = audioPlayer.volume * 100;
        volumeBar.value = volume;

        if (audioPlayer.muted) {
            volumeIcon.style.color = mutedColor;
        } else {
            volumeIcon.style.color = ''; 
        }
    });

    volumeBar.addEventListener('input', function () {
        const volumeLevel = volumeBar.value / 100;
        audioPlayer.volume = volumeLevel;
        audioPlayer.muted = false;  
        volumeBar.style.background = `linear-gradient(90deg, ${mutedColor} ${volumeBar.value}%, transparent ${volumeBar.value}%)`;
    });

    volumeIcon.addEventListener('click', function () {
        audioPlayer.muted = !audioPlayer.muted;

        if (audioPlayer.muted) {
            volumeIcon.style.color = mutedColor;
        } else {
            volumeIcon.style.color = '';  
        }
    });
}
// ----------------------------------------------------------------

function showEditForm() {
    document.getElementById('editForm').style.display = 'block';
}

// function changeInfo(fieldName) {
//     var inputValue = document.getElementById(fieldName).value;
//     // Add logic to handle changing information
//     // This function can be modified according to your requirements
//     console.log(fieldName + ' changed to: ' + inputValue);
// }

function doneEditing() {
    document.getElementById('editForm').style.display = 'none';
}


// ------------------------------------------------------------------
// Component add/delete playlist
// function toggleOptions() {
//     const optionsMenu = document.getElementById('options');
//     optionsMenu.style.display = optionsMenu.style.display === 'block' ? 'none' : 'block';
// }

// function addPlaylist() {
//     alert('Add Playlist option selected');
// }

function deletePlaylist(event) {
    event.stopPropagation(); 
    const imgPlayElement = event.target.closest('.img_play');
    const playlistId = imgPlayElement.dataset.playlistId;
    playlistElement = document.querySelector(`.img_play[data-playlist-id="${playlistId}"]`).closest('li');

    playlistElement.remove();
}

