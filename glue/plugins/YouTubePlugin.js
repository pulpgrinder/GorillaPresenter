YouTubePlugin = {

     renderHTML: async function (videoUrl) {
        let videoId = this.getVideoId(videoUrl);
        if (!videoId) 
            return '<div class="error">Invalid YouTube URL or ID</div>';

      // YouTube embeds don't work from file:// origins.
      // Show the real thumbnail with a play button; click opens video in a new tab.
      const thumbUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

      return `<a href="${watchUrl}" target="_blank" rel="noopener" class="youtube-thumb-link">
        <div class="youtube-thumb-container">
          <img src="${thumbUrl}" alt="YouTube video" class="youtube-thumb-img">
          <div class="youtube-play-btn">&#9654;</div>
        </div>
      </a>`;
    },

    getVideoId:function(str) {
      if (!str) return null;
      str = str.trim();

      // Already a clean 11-char ID
      if (/^[a-zA-Z0-9_-]{11}$/.test(str)) return str;

      // Common URL patterns
      const patterns = [
        /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i
      ];

      for (const pattern of patterns) {
        const m = str.match(pattern);
        if (m?.[1]) return m[1];
      }

      return null;
    },

}