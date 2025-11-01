window.onload = function() {
  const form = document.getElementById('signup-form');
  const nameInput = document.getElementById('textarea');
  const emailInput = document.getElementById('email');
  const emailError = document.getElementById('emailError');

  form.addEventListener('submit', function(event) {
      let isValid = true;

      if (nameInput.value.trim() === '') {
          isValid = false;
          alert('You did not type anything in the comment section area! Please Try Typing Something.');
      }

      if (emailInput.value.trim() === '') {
          isValid = false;
          emailError.textContent = 'Please enter your email.';
          
      } else {
          emailError.textContent = '';
      }

      if (!isValid) {
          event.preventDefault(); 
      }
  });
};

scrollToTopButton.addEventListener('click', () => {
  console.log('Button clicked');
  document.body.scrollTop = 0; 
  document.documentElement.scrollTop = 0; 
});

window.addEventListener('load', function() {
    // Check if the user has visited before
    if (!localStorage.getItem('visitedBefore')) {
        // If it's the first visit, show the loader for 5 seconds
        setTimeout(function() {
            // Hide the loader after 5 seconds
            document.getElementById('loader').style.display = 'none';
            // Show the main content after the loader is hidden
            document.getElementById('main-content').style.display = 'block';
        }, 5000); // 5000 milliseconds = 5 seconds

        // Mark that the user has visited before by setting a value in localStorage
        localStorage.setItem('visitedBefore', 'true');
    } else {
        // If the user has visited before, skip the loader and show content immediately
        document.getElementById('loader').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
    }
});




window.onload = function() {
    var img = new Image();  // Create a new image element
    var screenWidth = window.innerWidth;

    // Choose the correct image based on screen width
    if (screenWidth >= 1025) { // PC devices
        img.src = 'images/wave for pc.webp';
    } else if (screenWidth <= 1024 && screenWidth > 480) { // Tablet devices
        img.src = 'images/wave for tablet.webp';
    } else if (screenWidth <= 480) { // Phone devices
        img.src = 'images/wave for phone.jpg';
    }

    // Once the image is fully loaded, set it as the background
    img.onload = function() {
        document.documentElement.style.backgroundImage = 'url(' + img.src + ')';
    };

    // If something goes wrong and the image doesn't load, fallback to the white background
    img.onerror = function() {
        console.error('Image failed to load.');
        document.documentElement.style.backgroundColor = '#000000';
    };
};

if (window.innerWidth < 360) {
    document.body.innerHTML = ' <p class="notsupported">Device Not Supported to view the Contents of this Website</p> <lable class="screen">Please use a device with a bigger SCREEN</lable><br><br>'; // Remove all content
}



/*window.onscroll = function(){
    var button = document.getElementById("scrollToTopButton");
    if(window.scrollY >= 500){
        button.style.display = "block";
    }
    else{
        button.style.display = "none";

    }
}*/

