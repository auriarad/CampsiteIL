// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
    'use strict'

    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')

    const starRating = document.querySelectorAll('.rating label');
    const ratingCont = document.querySelector('.rating');
    let ratingActivated = false;
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault()
                event.stopPropagation()
            }
            form.classList.add('was-validated')

            if (starRating && !ratingActivated) {
                for (const star of starRating) {
                    star.classList.add('noChosenRating')
                }
            }

        }, false)
    })

    if (ratingCont) {
        ratingCont.addEventListener('mouseover', event => {
            for (const s of starRating) {
                s.classList.remove('noChosenRating')
            }
        })

        ratingCont.addEventListener('click', event => {
            ratingActivated = true;
        })

    }


})()
