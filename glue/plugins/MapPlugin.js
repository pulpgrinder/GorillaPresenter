MapPlugin = {

    renderHTML: async function (mapSpec) {
        let location = encodeURIComponent(mapSpec.trim());

        return `<div style="position:relative;">
<iframe allow="fullscreen" allowfullscreen class="mapiframe" width="600" height="450" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?q=${location}&t=m&z=11&ie=UTF8&iwloc=B&output=embed"></iframe>
</div>`;
    }
}
