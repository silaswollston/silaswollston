function play(span, audio, elapsed_time_span, duration_span, timeline_div) {
    const audio_player = create_element("audio", "audio-player");
    audio_player.src = audio;

    const container = create_element("div", "play-buttons");
    const button = create_element("div", "play-button");
    button.classList.add('paused');

    const span_info = create_element("span", "span-info");
    span_info.textContent = span;

    button.addEventListener("click", () => {
        const all_players = document.querySelectorAll('.play-button');
        const all_audio_players = document.querySelectorAll('.audio-player');

        if (button.classList.contains('paused')) {
            all_players.forEach((player, index) => {
                if (player !== button) {
                    player.classList.add('paused');
                    all_audio_players[index].pause();
                }
            });

            button.classList.remove('paused');
            audio_player.play();
            requestAnimationFrame(updateTimeline); // Start updating on play
        } else {
            button.classList.add('paused');
            audio_player.pause();
            cancelAnimationFrame(animationFrameId); // Stop updating on pause
        }
    });

    // Update elapsed time, duration, and timeline width during playback
    let animationFrameId;
    function updateTimeline() {
        const elapsed = audio_player.currentTime;
        const duration = audio_player.duration;

        // Update the elapsed time span
        elapsed_time_span.textContent = format_time(elapsed);

        // Update the duration span continuously
        if (!isNaN(duration) && duration > 0) {
            duration_span.textContent = format_time(duration);

            // Calculate percentage of time passed
            const percentage = (elapsed / duration) * 100;

            // Update the timeline width
            timeline_div.style.width = `${percentage}%`;

            // Request the next frame
            animationFrameId = requestAnimationFrame(updateTimeline);
        }
    }

    // Utility function to format time
    function format_time(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Initialize
    append_children(container, [button, span_info, audio_player]);

    return container;
}

function generate_music_player(el, cover_src, clip, track) {
    const music_player = create_element("div", "music-player, embed");
    const cover_image = create_element("div", "cover-image");
    cover_image.style.backgroundImage = `url(${cover_src})`;

    const play_container = create_element("div", "play-container");
    const elapsed_time = create_element("span", "elapsed-time");
    const duration = create_element("span", "duration");

    // Initialize elapsed time and duration
    elapsed_time.textContent = "0:00";
    duration.textContent = "--:--";

    // Timeline div for visual progress
    const timeline = create_element("div", "timeline");
    const elapsed = create_element("div", "elapsed");
    timeline.appendChild(elapsed);

    // Pass references to the play function
    const play_clip = play("Play clip", clip, elapsed_time, duration, elapsed);
    const play_from_start = play("Play from start", track, elapsed_time, duration, elapsed);

    append_children(play_container, [play_clip, play_from_start]);

    const time_values = create_element("div", "time-values");
    append_children(time_values, [elapsed_time, duration]);

    get_average_light_dark_colors(cover_src, function(colors) {
        music_player.style.setProperty("--dark-col", colors.dark_color);
        music_player.setAttribute("light-col", colors.light_color);
        music_player.setAttribute("dark-col", colors.dark_color);
    });

    append_children(music_player, [cover_image, play_container, timeline, time_values]);

    return music_player;
}
