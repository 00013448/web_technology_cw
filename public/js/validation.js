function setValidationErrors(errors){
    errors = JSON.parse(errors.replace(/&quot;/g,'"'))
    for(const error of errors){
        const errorField = document.getElementById(error.param)
        if(errorField) errorField.innerText = error.msg
    }
}