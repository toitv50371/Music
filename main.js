const $ = document.querySelector.bind (document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'PLAYER'

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playlist = $('.playlist');
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const radomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom : false,
    isRepeat : false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig:function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    
    song: [
        {
            name:'Nevada',
            singer:'Vicetone',
            path:'./assets/music/Nevada.mp3',
            img: './assets/img/Nevada.jpg',
        },
        {
            name:'Stand Up',
            singer:'HARRIET',
            path:'./assets/music/StandUp.mp3',
            img: './assets/img/standup.png',
        },
        {
            name:'Plain jane',
            singer:'Nicki Minaj',
            path:'./assets/music/PlainJane.mp3',
            img: './assets/img/plainjane.jpg',
        },
        {
            name:'Summertime Sadness',
            singer:'Lana Del Rey',
            path:'./assets/music/summer.mp3',
            img: './assets/img/summer.png',
        },
        {
            name:'Left and Right',
            singer:'Charlie Puth',
            path:'./assets/music/Left And Right.mp3',
            img: './assets/img/leftandright.jpg',
        },
        {
            name:'YADMABBM',
            singer:'Phuc Du',
            path:'./assets/music/YADMABBM.mp3',
            img: './assets/img/YADMABBM.jpg',
        },
        {
            name:'Dancin Remix',
            singer:'Dancin',
            path:'./assets/music/dancin.mp3',
            img: './assets/img/dancin.jpg',
        },
    ],

    render: function (){
        const htmls = this.song.map((song,index) =>{
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.img}')">
                    </div>
                    <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `

        });
        playlist.innerHTML = htmls.join('');


    },
    defineProperties:function () {
        Object.defineProperty(this,'currentSong',{
            get:function () {
                return this.song[this.currentIndex];
            },
        })
    },
    handleEvent: function (){
       
        // Xử lý CD quay /dừng
        const cdThumbAnimate =  cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            interations: Infinity
        })
        cdThumbAnimate.pause();
    


        const cdWidth = cd.offsetWidth
        // Xử lý phóng to/ thu nhỏ 
        document.onscroll = function() {
            
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click play
        playBtn.onclick = function () {
            if (app.isPlaying) {
                audio.pause();            
            }else {
                audio.play();
            }
        }
        // Khi song được play
        audio.onplay = function (){
            app.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play();
        }
        // Khi song pause
        audio.onpause = function (){
            app.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause();
        }
        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function (){
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }
        // Xử lý khi tua song
        progress.onchange = function (event) {
            const seekTime = audio.duration / 100 * event.target.value
            audio.currentTime = seekTime
        }

        //Khi next song
        nextBtn.onclick = function () {
            if(app.isRandom) {
                app.playRandomSong();           
            }else {
                app.nextSong();
            }
            
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }
        // Khi prev song
        prevBtn.onclick = function () {
            if(app.isRandom) {
                app.playRandomSong();
            }else {
                app.prevSong();
            }
            audio.play();
            app.render();
            app.scrollToActiveSong();
        }
        // Xu ly bat/ tat ramdom Song
        radomBtn.onclick = function () {
            app.isRandom = !app.isRandom
            app.setConfig('isRandom', app.isRandom)
            radomBtn.classList.toggle('active',app.isRandom)
        }
        
        // Xử lý lặp lại một song
        repeatBtn.onclick = function () {
            app.isRepeat = !app.isRepeat
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle('active',app.isRepeat)
        }
        // Xử lý next song khi audio  ended
        audio.onended = function (){
            if(app.isRepeat) {
                audio.play();
            }else {
                nextBtn.click()
            }
        }
                // Lắng nghe hành vi click vào playlist
        playlist.onclick = function (event) {

            const songNode = event.target.closest('.song:not(.active)') ;
            // Xử lý khi click vào song
            if(songNode || event.target.closest('.option')){
                // Xử lý khi click vào song
                if(songNode){
                    app.currentIndex = Number(songNode.dataset.index)
                    app.loadCurrentSong();       
                    app.render();
                    audio.play();

                }
            
            }
        }
    },
    scrollToActiveSong: function () {
        setTimeout(() =>{
            $('.song.active').scrollIntoView({
                behavior:'smooth',
                block: 'end',
                inline: "nearest" 
            })
        },300)
    },
    loadCurrentSong: function (){
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.img}')`
        audio.src = this.currentSong.path

    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function (){
        this.currentIndex++
        if (this.currentIndex >= this.song.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function (){
        this.currentIndex--
        if (this.currentIndex < 0){
            this.currentIndex = this.song.length - 1;
        }
        this.loadCurrentSong()
    },
    //
    playRandomSong: function(){
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.song.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function (){
        // Gán cấu hình từ config vào ứng dụng
        this.loadConfig ()

        // Định nghĩa các thuộc tính cho object
        this.defineProperties ()

        // Lắng nghe/ xử lý các sự kiện (DOM)
        this.handleEvent()

        // tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        // Render playlists
        this.render()

        // Hiển thị trạng thái ban đầu của button repeat và random
        radomBtn.classList.toggle('active',app.isRandom)
        repeatBtn.classList.toggle('active',app.isRepeat)
    }
}

app.start();
