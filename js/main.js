(function () {
  // One-line change: paste Deon's Apps Script web-app URL between the quotes.
  var FORM_ENDPOINT = "";

  var EMAIL_FALLBACK =
    "Thank you for getting in touch. Please email info@littletides.co.za and we will be glad to help.";
  var SEND_ERROR =
    "Sorry, we could not send your form just now. Please email info@littletides.co.za and we will be glad to help.";
  var THANKS =
    "Thank you. We have received your form and will be in touch. If you need to reach us sooner, please email info@littletides.co.za.";

  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function showStatus(form, message, kind) {
    var status = form.querySelector(".form-status");
    if (!status) return;
    status.textContent = message;
    status.classList.add("show");
    status.classList.remove("ok", "err");
    if (kind) status.classList.add(kind);
  }

  function setupHowHeard(form) {
    var select = form.querySelector('select[name="how_heard"]');
    if (!select) return;
    var otherRow = form.querySelector(".how-heard-other");
    function sync() {
      if (!otherRow) return;
      otherRow.hidden = select.value !== "Other";
    }
    select.addEventListener("change", sync);
    sync();
  }

  function payloadFrom(form) {
    var data = new FormData(form);
    var addons = [];
    if (data.get("addon_aftercare")) addons.push("Aftercare");
    if (data.get("addon_holiday")) addons.push("Holiday programme");
    data.set("addons", addons.join(", "));
    if (data.get("how_heard") === "Other" && data.get("how_heard_other")) {
      data.set("how_heard", "Other: " + data.get("how_heard_other"));
    }
    return new URLSearchParams(data);
  }

  function bindForm(form) {
    setupHowHeard(form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      if (!form.querySelector('[name="popia_consent"]').checked) {
        showStatus(form, "Please tick the consent box to continue.", "err");
        return;
      }
      if (!FORM_ENDPOINT) {
        showStatus(form, EMAIL_FALLBACK, "err");
        return;
      }
      var body = payloadFrom(form);
      fetch(FORM_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: body,
      })
        .then(function () {
          showStatus(form, THANKS, "ok");
          form.reset();
          setupHowHeard(form);
        })
        .catch(function () {
          showStatus(form, SEND_ERROR, "err");
        });
    });
  }

  var enquiry = document.getElementById("enquiry-form");
  var application = document.getElementById("application-form");
  if (enquiry) bindForm(enquiry);
  if (application) bindForm(application);
})();
