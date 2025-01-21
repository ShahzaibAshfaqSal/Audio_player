let currentSong = new Audio();
let songs;
let currentFolder;

function formatTime(seconds) {
    const roundedSeconds = Math.floor(seconds);
    const minutes = Math.floor(roundedSeconds / 60);
    const remainingSeconds = roundedSeconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currentFolder = folder;

    // Fetch the folder's info.json file
    let response = await fetch(`https://shahzaibashfaqsal.github.io/Audio_player/${folder}/info.json`);
    
    let info = await response.json();


    if (!info.music || !Array.isArray(info.music)) {
        console.error(`No valid 'music' array found in info.json for folder: ${folder}`);
        return []; 
    }


     songs = [];
    for (let songPath of info.music) {
      //  console.log(songPath);
        songs.push(songPath); 
    }

}


function playMusic(track) {
    // Set the new track and start playing
    currentSong.src = track; // Assign the new track source
    currentSong.play(); // Play the new track

    // Update UI elements
    play.src = "8665214_circle_pause_icon.png"; // Update play button to pause icon
    let songInfo = document.querySelector(".songInfo");
    let songTime = document.querySelector(".songTime");
    songInfo.innerHTML = track; // Display track name
    songTime.innerHTML = "00:00 / 00:00"; // Reset time display
    songInfo.style.color = "black";
    songTime.style.color = "black";
}


async function displayAlbums(selectedMood = null) {
    let baseUrl = window.location.origin;

    let response = await fetch(`https://shahzaibashfaqsal.github.io/Audio_player/songs/songs.json`);
    let data = await response.json();


    let folders = data.folders;


    let songAlbums = document.getElementsByClassName("songAlbums")[0];
    songAlbums.innerHTML = '';


    let songsUL = document.querySelector('.songList ul');
    songsUL.innerHTML = '';

    for (let folder of folders) {

        if (selectedMood && folder.toLowerCase() !== selectedMood.toLowerCase()) {
            continue; 
        }


        let albumResponse = await fetch(`https://shahzaibashfaqsal.github.io/Audio_player/songs/${folder}/info.json`);
        let albumInfo = await albumResponse.json();


        songAlbums.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
                        <circle cx="16" cy="16" r="16" fill="green" />
                        <g transform="translate(4, 4) scale(1)">
                            <path
                                d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                stroke="black" stroke-width="1.5" stroke-linejoin="round" fill="none" />
                        </g>
                    </svg>
                </div>
                <img src="https://shahzaibashfaqsal.github.io/Audio_player/songs/${folder}/Cover.jpeg" alt="" />
                <h2>${albumInfo.title}</h2>
                <p>${albumInfo.description}</p>
            </div>`;
    }


    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener('click', async item => {
            await loadSongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });
}



async function loadSongs(folder) {
    await getSongs(folder);
    playMusic(songs[0]);
    let songsUL = document.querySelector('.songList ul');
    songsUL.innerHTML = '';
    for (const song of songs) {
        let songsLI = document.createElement('li');

        let img1 = document.createElement('img');
        img1.src = 'music-svgrepo-com.svg';
        img1.classList.add('svg-size');

        let infoDiv = document.createElement('div');
        infoDiv.classList.add('info');
        let songNameDiv = document.createElement('div');
        songNameDiv.classList.add('songName');
        songNameDiv.textContent = song;
        let songArtistDiv = document.createElement('div');
        songArtistDiv.textContent = 'Unknown Artist';

        infoDiv.appendChild(songNameDiv);
        infoDiv.appendChild(songArtistDiv);

        let img2 = document.createElement('img');
        img2.src = 'play-button-4210.svg';
        img2.classList.add('svg-size');

        songsLI.appendChild(img1);
        songsLI.appendChild(infoDiv);
        songsLI.appendChild(img2);
        songsUL.appendChild(songsLI);
    }


    Array.from(document.querySelector('.songList').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', () => {
            playMusic(e.querySelector('.info').firstElementChild.innerHTML);
        });
    });
}

async function main() {
   await displayAlbums();

    play.addEventListener('click', () => {
        if (currentSong.paused) {
            play.src = "8665214_circle_pause_icon.png";
            currentSong.play();
        } else {
            play.src = "play-button-4210.svg";
            currentSong.pause();
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector('.songTime').innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector('.circle').style.left = (currentSong.currentTime / currentSong.duration) * 100 + '%';
    });

    document.querySelector('.seekBar').addEventListener('click', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.getElementsByClassName("circle")[0].style.left = percent + '%';
        currentSong.currentTime = (percent / 100) * currentSong.duration;
    });

    document.getElementsByClassName('hamBurgerDiv')[0].addEventListener('click', () => {
        document.getElementsByClassName('left')[0].style.left = '0%';
    });

    document.getElementsByClassName('cross-btn')[0].addEventListener('click', () => {
        document.getElementsByClassName('left')[0].style.left = '-100%';
    });

    previous.addEventListener('click', () => {
        // Dynamically find the relative path starting from "songs/"
        let currentPathIndex = currentSong.src.indexOf("songs/");
        if (currentPathIndex === -1) {
            console.error("Current song path does not contain 'songs/'.");
            return;
        }
        
        // Extract and decode the relative path
        let currentPath = decodeURIComponent(currentSong.src.substring(currentPathIndex));
    
        // Find the index of the current song in the songs array
        let index = songs.indexOf(currentPath);
    
        if (index === -1) {
            console.error("Current song not found in the songs array.");
            return;
        }
    
        // Navigate to the previous song
        if (index - 1 < 0) {
            playMusic(songs[songs.length - 1]); // Play the last song if at the first song
        } else {
            playMusic(songs[index - 1]); // Play the previous song
        }
    });
    
    next.addEventListener('click', () => {
        // Dynamically find the relative path starting from "songs/"
        let currentPathIndex = currentSong.src.indexOf("songs/");
        if (currentPathIndex === -1) {
            console.error("Current song path does not contain 'songs/'.");
            return;
        }
        
        // Extract and decode the relative path
        let currentPath = decodeURIComponent(currentSong.src.substring(currentPathIndex));
    
        // Find the index of the current song in the songs array
        let index = songs.indexOf(currentPath);
    
        if (index === -1) {
            console.error("Current song not found in the songs array.");
            return;
        }
    
        // Navigate to the next song
        if (index + 1 >= songs.length) {
            playMusic(songs[0]); // Play the first song if at the last song
        } else {
            playMusic(songs[index + 1]); // Play the next song
        }
    });
    
    // Volume control
    document.querySelector('.valRange').addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    });
    

    // Add an event listener to mute the volume 

    document.querySelector('.volume>img').addEventListener('click',(e)=>
    {
        if(e.target.src == "http://127.0.0.1:5500/f974e30f-891f-4677-ae5c-5b99a4a74200.svg")
        {
            e.target.src = "volume-mute-svgrepo-com.svg";
            currentSong.volume = 0;
            document.querySelector('.valRange').value = 0;
        }
        else
        {
            e.target.src = "f974e30f-891f-4677-ae5c-5b99a4a74200.svg";
            currentSong.volume = .4;
            document.querySelector('.valRange').value = 40;
        }
    })
}

// Hambuger div event liatener to show cross button
window.setInterval(()=>
{
    if(window.innerWidth>1100)
        document.querySelector('.cross-btn').style.display = 'none';
},1000)


document.querySelector('.hamBurgerDiv').addEventListener('click',()=>
{
    document.querySelector('.cross-btn').style.display = 'block';
})

document.querySelector('.cross-btn').addEventListener('click',()=>
{
    document.querySelector('.cross-btn').style.display = 'none';
})
main();



/// New One here to be placed 

// Select the mood overlay and buttons
function moodPreferenceTaker()
{
    const moodSelectorOverlay = document.getElementById('moodSelectorOverlay');
    const moodButtons = document.querySelectorAll('.mood-btn');
    const skipButton = document.querySelector('.skip-btn');
    
    // Show modal after 2 seconds
    setTimeout(() => {
        moodSelectorOverlay.classList.add('active');
        document.querySelector('.mood-content').classList.add('active');
    }, 2000);
    
    moodButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const selectedMood = e.target.getAttribute('data-mood');
        //    console.log('Selected Mood:', selectedMood);
            displayAlbums(selectedMood); // Display albums that match the selected mood
            hideMoodSelector();
        });
    });
    
    skipButton.addEventListener('click', () => {
    //    console.log('User skipped mood selection');
        displayAlbums(); // Show all albums if the user skips mood selection
        hideMoodSelector();
    });
}
moodPreferenceTaker();

// Function to hide mood selector
function hideMoodSelector() {
    moodSelectorOverlay.classList.remove('active');
    document.querySelector('.mood-content').classList.remove('active');
}


// Add event Listener to choose mood button 

document.querySelector('.signUp').addEventListener('click',moodPreferenceTaker);
