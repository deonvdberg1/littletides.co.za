(function () {
  var FORM_ENDPOINT = "https://littletides-apply.young-tooth-19b1.workers.dev/";

  var EMAIL_FALLBACK =
    "Thank you for getting in touch. Please email info@littletides.co.za and we will be glad to help.";
  var SEND_ERROR =
    "Sorry, something went wrong sending your application. Please try again, or email info@littletides.co.za or WhatsApp 071 944 5561.";
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
    var submitBtn = form.querySelector('button[type="submit"]');
    var sending = false;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return;
      if (!form.reportValidity()) return;
      if (!form.querySelector('[name="popia_consent"]').checked) {
        showStatus(form, "Please tick the consent box to continue.", "err");
        return;
      }
      if (!FORM_ENDPOINT) {
        showStatus(form, EMAIL_FALLBACK, "err");
        return;
      }

      sending = true;
      if (submitBtn) submitBtn.disabled = true;

      fetch(FORM_ENDPOINT, {
        method: "POST",
        mode: "cors",
        body: payloadFrom(form),
      })
        .then(function (res) {
          return res.text().then(function (text) {
            var data = null;
            try {
              data = text ? JSON.parse(text) : null;
            } catch (err) {
              data = null;
            }
            return { res: res, data: data };
          });
        })
        .then(function (result) {
          if (result.res.ok && result.data && result.data.ok === true) {
            showStatus(form, THANKS, "ok");
            form.reset();
            setupHowHeard(form);
          } else {
            showStatus(form, SEND_ERROR, "err");
          }
        })
        .catch(function () {
          showStatus(form, SEND_ERROR, "err");
        })
        .then(function () {
          sending = false;
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  var application = document.getElementById("application-form");
  if (application) bindForm(application);
})();
