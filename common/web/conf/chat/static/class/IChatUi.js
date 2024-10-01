class IChatUi {
    constructor () {

    }

    init() {

    }


    // ===============================================================================================
    // ======================================= Display Element =======================================
    // ===============================================================================================


    async displayMenus() {
        try {
            console.log('displayMenus');
            let preMenus = document.getElementById('pre-menu');
            preMenus.classList.add('active');
        } catch (error) {
            console.error('Failed to displayMenus', error);
        }
    }

    async displaySubMenus() {
        try {
            let radialMenu = document.getElementById('radial-menu');
            radialMenu.classList.add('active');
        } catch (error) {
            console.error('Failed to displaySubMenus', error);
        }
    }


    // ===============================================================================================
    // ======================================= Hide Element =======================================
    // ===============================================================================================


    async hidePanel() {
        try {
            const pannel = document.getElementById('pannel');
            pannel.classList.remove('active');
            pannel.innerHTML = '';
        } catch (error) {
            console.error('Failed to hideSocialMenus', error);
        }
    }

    async hideSubMenus() {
        try {
            let radialMenu = document.getElementById('radial-menu');
            radialMenu.innerHTML = '';
            radialMenu.classList.remove('active');
        } catch (error) {
            console.error('Failed to hideSubMenus', error);
        }
    }
}

export default IChatUi;