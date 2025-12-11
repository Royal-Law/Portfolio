document.addEventListener("DOMContentLoaded", () => {
        let countdown = 90;
        const countdownElement = document.getElementById('countdown');
        const overlayElement = document.getElementById('overlay');
        let interval; 

        setTimeout(() => {
            overlayElement.style.display = 'flex';
            interval = setInterval(() => {
                countdown--;
                countdownElement.textContent = countdown;

                if (countdown === 0) {
                    clearInterval(interval);
                    overlayElement.style.display = 'none';
                }
            }, 1000);
        }, 2000);

        document.getElementById("closeBtn").addEventListener("click", function () {
            clearInterval(interval); 
            overlayElement.style.display = "none"; 
        });

    });

    

function openModal() {
    const modal = document.getElementById("myModal");
    const backdrop = document.getElementById("modalBackdrop");
    modal.style.display = "block";
    backdrop.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById("myModal");
    const backdrop = document.getElementById("modalBackdrop");
    modal.style.display = "none";
    backdrop.style.display = "none";
}

// Close modal when clicking outside
/* window.onclick = function(event) {
    const modal = document.getElementById("myModal");
    const backdrop = document.getElementById("modalBackdrop");
    if (event.target == modal || event.target == backdrop) {
        modal.style.display = "none";
        backdrop.style.display = "none";
    }
}*/

if (window.innerWidth < 360) {
    document.body.innerHTML = ' <p class="notsupported">Device Not Supported to view the Contents of this Website</p> <lable class="screen">Please use a device with a bigger SCREEN</lable><br><br>'; 
}