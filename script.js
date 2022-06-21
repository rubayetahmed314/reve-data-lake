const imageHolder = document.querySelector("#imageHolder");
let displayImg = document.querySelector("#zoom");
const submitBtn = document.querySelector("#submitBtn");
const convertBtn = document.querySelector("#convertBtn");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const psmMenuButton = document.querySelector("#psmMenuButton");
const languageMenuButton = document.querySelector("#languageMenuButton");
const imgStat = document.querySelector("#imgStat");
const successAlert = document.querySelector("#successAlert");
const errorAlert = document.querySelector("#errorAlert");
const zoomInput = document.querySelector("#zoomInput");
let files = [];

const content = document.querySelector("#content");
const reference = document.querySelector("#reference");
let currentImageURL = null;
let currentImageIndex = -1;
let currentPSM = 3;
let currentLang = "ben";
let currentPredictedText = '';

const API = "http://localhost:8000/api";
// const API = "https://reve-data-lake.herokuapp.com/api";

// let ui = new UI();

const picReader = new FileReader(); // RETRIEVE DATA URI

picReader.addEventListener("load", function (event) {
    // //Initiate the JavaScript Image object.
    // let image = new Image();

    // //Set the Base64 string return from FileReader as source.
    // image.src = event.target.result;

    // //Validate the File Height and Width.
    // image.onload = function () {
    //     var height = this.height;
    //     var width = this.width;
    //     if (height > 1080 || width > 1920) {
    //     alert("Height and Width must not exceed 100px.");
    //     return false;
    //     }
    //     alert("Uploaded image has valid Height and Width.");
    //     return true;
    // };
    // LOAD EVENT FOR DISPLAYING PHOTOS
    const picFile = event.target;
    // console.log("PicFile", picFile);
    // imageHolder.innerHTML = `<img class="img-fluid rounded" src="${picFile.result}" title="${files[currentImageIndex].name}"/>`;
    
    displayImg.setAttribute("src", picFile.result);
    displayImg.setAttribute("title", files[currentImageIndex].name);
    // <a href="large.jpg" class="MagicZoom" data-options="zoomPosition: inner"><img src="small.jpg" /></a>
    // output.appendChild(div);
    // console.log(picFile.result);
    currentImageURL = picFile.result;
});

function updateZoom(value) {
    $("#zoom").replaceWith(`<img class="img-fluid rounded" src="placeholderimgrgb.jpg" title="Placeholder Image" alt="Image To Zoom" id="zoom"/>`);
    displayImg = document.querySelector("#zoom");

    if(files.length > 0){
        picReader.readAsDataURL(files[currentImageIndex]);
    }

    $("#zoom").imagezoomsl({
        innerzoom: true,
        innerzoommagnifier: false,
        zoomstart: value,
    });
}

function increaseValue() {
    var value = parseInt(zoomInput.value, 10);
    value = isNaN(value) ? 0 : value;
    value > 19 ? value = 19 : '';
    value++;
    zoomInput.value = value;

    updateZoom(value);
}
  
function decreaseValue() {
    var value = parseInt(zoomInput.value, 10);
    value = isNaN(value) ? 0 : value;
    value < 1 ? value = 1 : '';
    value--;
    zoomInput.value = value;

    updateZoom(value);
}

zoomInput.addEventListener("input", event => {
    // console.log("changed");
    if (zoomInput.value.match(/^[2-9]$|^1[0-9]$|^20$/) != null) {
        updateZoom(parseInt(zoomInput.value));
    } else {
        if(isNaN(parseInt(zoomInput.value))){
            zoomInput.value = "2";
        } else if(parseInt(zoomInput.value)<2){
            zoomInput.value = "2";
            updateZoom(2);
        } else if(parseInt(zoomInput.value)>20){
            zoomInput.value = "20";
            updateZoom(20);
        }
    }
});

const updatePrevNext = () => {
    if(currentImageIndex > 0){
        prevBtn.disabled = false;
    } else {
        prevBtn.disabled = true;
    }
    if(currentImageIndex < files.length - 1){
        nextBtn.disabled = false;
    } else{
        nextBtn.disabled = true;
    }
}

const showSuccessError = (param, message) => {
    if(param == "success"){
        successAlert.style.display="block";
        successAlert.innerHTML = `<strong>Success!</strong> ${message}.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`;
        setTimeout(() => {
            successAlert.style.display="none";
        }, 5000);
    } else if(param == "error"){
        errorAlert.style.display="block";
        errorAlert.innerHTML = `<strong>Error!</strong> ${message}.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>`;
        setTimeout(() => {
            errorAlert.style.display="none";
        }, 10000);
    }
}

$(document).ready(function () {
    $('#psm a').on('click', function () {
      currentPSM = parseInt($(this).text().split(' ')[0]);
      psmMenuButton.textContent = currentPSM;
      console.log("Current PSM is "+ currentPSM);
    });

    $('#lang a').on('click', function () {
        currentLang = $(this).text().toLowerCase().slice(0,3);
        languageMenuButton.textContent = currentLang;
        console.log("Current Lang is "+ currentLang);
      });

    $("#zoom").imagezoomsl({
        innerzoom: true,
        innerzoommagnifier: false,
        zoomstart: 2,
    });
});

if (document.querySelector('input[name="option"]')) {
    document.querySelectorAll('input[name="option"]').forEach(elem => {
        elem.addEventListener("change", function (event) {
            var item = event.target.value;
            console.log(item);
            if (item == "Manual") {
                reference.value = "";
                reference.disabled = true;
            } else {
                reference.disabled = false;
            }
        });
    });
}

/**
 * @param {"SHA-1"|"SHA-256"|"SHA-384"|"SHA-512"} algorithm https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
 * @param {string|Blob} data
 */
async function getHash(algorithm, data) {
    const main = async msgUint8 => {
        // https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
        const hashBuffer = await crypto.subtle.digest(algorithm, msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, "0")).join(""); // convert bytes to hex string
    };

    if (data instanceof Blob) {
        const arrayBuffer = await data.arrayBuffer();
        const msgUint8 = new Uint8Array(arrayBuffer);
        return await main(msgUint8);
    }
    const encoder = new TextEncoder();
    const msgUint8 = encoder.encode(data);
    return await main(msgUint8);
}

content.addEventListener("input", event => {
    // console.log("changed");
    if (content.value.match(/\S/g) == null) {
        submitBtn.disabled = true;
    } else {
        submitBtn.disabled = false;
    }
});

submitBtn.addEventListener("click", async function (e) {
    let contentText = content.value;
    let referenceText = reference.value;
    let selected = document.querySelector('input[name="option"]:checked').value;

    console.log(contentText, referenceText);
    console.log(selected);

    // const hashHex = await getHash("SHA-256", content.value);
    // console.log(hashHex);

    if (selected == "Web Link" && referenceText.match(/\S/g) == null) {
        alert(
            'Please provide a reference or select "Manual".\nThen click "Submit".'
        );
    } else {
        fetch(`${API}/postData`, {
            method: "POST",
            // mode: "no-cors",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content: content.value.replaceAll("'",`"`),
                predictedText: currentPredictedText.replaceAll("'",`"`),
                reference: selected == "Manual" ? "Manual" : reference.value.replaceAll("'",`"`),
                ocr: selected == "OCR" ? true : false,
            }),
        })
            .then(response => {
                return response.json();
            })
            .then(data => {
                // this.setState({
                //     loading: false,
                // });
                console.log("Response: ", data);
                showSuccessError("success", "Successfully uploaded to database!");

                content.value = "";
                // reference.value = "";
                // imageHolder.innerHTML = '';
                if(selected == "OCR"){
                    files.splice(currentImageIndex, 1);
                    console.log(files.length);
                    console.log(document.querySelector("#files"));

                    if(files.length > 0){
                        if(currentImageIndex > files.length - 1){
                            currentImageIndex = files.length - 1;
                        }
                        if(currentImageIndex < 0){
                            currentImageIndex = 0;
                        }
                        picReader.readAsDataURL(files[currentImageIndex]);
                        updatePrevNext();
                        document.getElementById("imgStat").innerText = `${currentImageIndex + 1} of ${files.length}`;
                        document.querySelector("#files").setAttribute("title", `${files.length} File(s) Chosen`);
                    } else{
                        displayImg.setAttribute("src", "placeholderimgrgb.jpg");
                        displayImg.setAttribute("title", "Placeholder Image");
                        document.getElementById("webLink").checked = true;
                        document.getElementById("ocr").disabled = true;
                        document.getElementById("imgStat").innerText = `0 of 0`;
                        document.querySelector("#files").setAttribute("title", `No File Chosen`);
                    }
                }
                reference.disabled = false;
                submitBtn.disabled = true;
            })
            .catch(err => {
                console.log("Error: ", err);
                showSuccessError("error", err.message.toString());
            });
    }
    // Fetch API
    // fetch(`https://api.github.com/users/${userText}`)
    //     .then(result => result.json())
    //     .then(data => {
    //         //console.log(data);
    //         if (data.message == 'Not Found') {
    //             // Show Alert
    //             ui.showAlert("User not Found!", "alert alert-danger");
    //         } else {
    //             //Show Profile
    //             ui.showProfile(data);
    //         }
    //     })

    // Clear Profile
    // ui.clearProfile();
});

document.querySelector("#files").addEventListener("change", e => {
    //CHANGE EVENT FOR UPLOADING PHOTOS
    if (window.File && window.FileReader && window.FileList && window.Blob) {
        //CHECK IF FILE API IS SUPPORTED
        if(e.target.files.length > 0){
            console.log("Image Image !!!");
            files = Array.from(e.target.files); //FILE LIST OBJECT CONTAINING UPLOADED FILES
        
            // console.log("Files:", files);
            // console.log(Array.from(files));

            // const output = document.querySelector("#result");
            // output.innerHTML = "";
            for (let i = 0; i < files.length; i++) {
                // LOOP THROUGH THE FILE LIST OBJECT
                if (!files[i].type.match("image"))
                {
                    files.splice(i,1); // ONLY PHOTOS (SKIP CURRENT ITERATION IF NOT A PHOTO)
                };
            }
            if(files.length>0){
                currentImageIndex = 0;
                content.value = "";
                console.log(files[currentImageIndex]);
                picReader.readAsDataURL(files[currentImageIndex]);
                updatePrevNext();
                document.getElementById("ocr").disabled = false;
                document.getElementById("ocr").checked = true;
                document.getElementById("imgStat").innerText = `${currentImageIndex + 1} of ${files.length}`;
                document.querySelector("#files").setAttribute("title", `${files.length} File(s) Chosen`); // file গুলোর নাম নিচে নিচে দেখালে সুন্দর হয়
            }
        }
    } else {
        alert("Your browser does not support File API");
    }
});

convertBtn.addEventListener("click", e => {
    e.preventDefault();
    fetch(`${API}/convert`, {
        method: "POST",
        // mode: "no-cors",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            image: currentImageURL,
            psm_mode: currentPSM,
            lang: currentLang,
        }),
    })
        .then(response => {
            console.log("Response!");
            return response.json();
        })
        .then(data => {
            // this.setState({
            //     loading: false,
            // });
            console.log("Response: ", data);

            content.value = data.result;
            currentPredictedText = data.result;
            submitBtn.disabled = false;
            // this.setState({
            //     letter: data.letter,
            // });
        })
        .catch(err => {
            console.log("Error: ", err.message);
            showSuccessError("error", err.message.toString());
        });
});

prevBtn.addEventListener("click", e => {
    e.preventDefault();
    if(currentImageIndex > 0){
        currentImageIndex--;
        picReader.readAsDataURL(files[currentImageIndex]); //READ PREV IMAGE
        content.value = "";
        // console.log("Pic Reader", picReader);
        document.getElementById("imgStat").innerText = `${currentImageIndex + 1} of ${files.length}`;
    }
    updatePrevNext();
});

nextBtn.addEventListener("click", e => {
    if(currentImageIndex < files.length - 1){
        currentImageIndex++;
        picReader.readAsDataURL(files[currentImageIndex]); //READ NEXT IMAGE
        content.value = "";
        // console.log("Pic Reader", picReader);
        document.getElementById("imgStat").innerText = `${currentImageIndex + 1} of ${files.length}`;
    }
    updatePrevNext();
});
