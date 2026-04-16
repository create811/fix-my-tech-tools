(function () {
  function showError(result, message) {
    result.innerHTML = `<p class="error">${message}</p>`;
  }

  function getFieldValue(id) {
    const field = document.getElementById(id);
    return field ? field.value.trim() : "";
  }

  function getPriorityClass(priority) {
    if (priority === "High") {
      return "priority-high";
    }

    if (priority === "Medium") {
      return "priority-medium";
    }

    return "priority-low";
  }

  function formatDiagnosisResult(result, heading, label, labelValue, actions) {
    const listItems = actions.map(function (action) {
      return `<li>${action}</li>`;
    }).join("");

    result.innerHTML = `
      <p class="result-title">${heading}</p>
      <p><strong>${label}:</strong> <span class="${getPriorityClass(labelValue)}">${labelValue}</span></p>
      <p class="result-note">Recommended next steps:</p>
      <ol class="result-list">${listItems}</ol>
    `;
  }

  function formatDiskCleanupResult(result, priority, summary, urgency, actions) {
    const listItems = actions.map(function (action) {
      return `<li>${action}</li>`;
    }).join("");

    result.innerHTML = `
      <p class="result-title">Likely cleanup priority: ${priority}</p>
      <p><strong>Main issue summary:</strong> ${summary}</p>
      <p><strong>Urgency level:</strong> <span class="${getPriorityClass(urgency)}">${urgency}</span></p>
      <p class="result-note">Recommended next steps:</p>
      <ol class="result-list">${listItems}</ol>
    `;
  }

  initBatteryCalculator();
  initSlowLaptopTool();
  initWifiTool();
  initDiskCleanupTool();

function initBatteryCalculator() {
  const form = document.getElementById("battery-form");
  const result = document.getElementById("battery-result");

  if (!form || !result) {
    return;
  }

  function getStatus(healthPercentage) {
    if (healthPercentage >= 90) {
      return {
        label: "Good",
        className: "status-good"
      };
    }

    if (healthPercentage >= 70) {
      return {
        label: "Moderate",
        className: "status-moderate"
      };
    }

    return {
      label: "Replace battery",
      className: "status-replace"
    };
  }

  function showResult(healthPercentage, status) {
    result.innerHTML = `
      <p class="result-note">Estimated battery health</p>
      <p class="result-value">${healthPercentage}%</p>
      <p class="status ${status.className}">Status: ${status.label}</p>
    `;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const designInput = document.getElementById("design-capacity").value.trim();
    const fullChargeInput = document.getElementById("full-charge-capacity").value.trim();
    const designCapacity = Number(designInput);
    const fullChargeCapacity = Number(fullChargeInput);

    if (!designInput || !fullChargeInput) {
      showError(result, "Please enter both capacity values.");
      return;
    }

    if (!Number.isFinite(designCapacity) || !Number.isFinite(fullChargeCapacity)) {
      showError(result, "Please enter valid numbers only.");
      return;
    }

    if (designCapacity <= 0 || fullChargeCapacity <= 0) {
      showError(result, "Capacity values must be greater than zero.");
      return;
    }

    if (fullChargeCapacity > designCapacity) {
      showError(result, "Full charge capacity should not be greater than design capacity.");
      return;
    }

    // Battery health is full charge capacity divided by the original design capacity.
    const healthPercentage = Math.round((fullChargeCapacity / designCapacity) * 100);
    const status = getStatus(healthPercentage);

    showResult(healthPercentage, status);
  });
}

function initSlowLaptopTool() {
  const form = document.getElementById("slow-laptop-form");
  const result = document.getElementById("slow-laptop-result");

  if (!form || !result) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const storageType = getFieldValue("storage-type");
    const ramSize = getFieldValue("ram-size");
    const startupApps = getFieldValue("startup-apps");
    const diskFull = getFieldValue("disk-full");
    const updatesPending = getFieldValue("updates-pending");
    const getsHot = getFieldValue("gets-hot");

    if (!storageType || !ramSize || !startupApps || !diskFull || !updatesPending || !getsHot) {
      showError(result, "Please answer every question before analyzing your laptop.");
      return;
    }

    let issue = "General Windows performance issue";
    let priority = "Low";
    let actions = [
      "Restart the laptop and close apps you are not using.",
      "Disable unnecessary startup apps in Task Manager.",
      "Check Windows Update and install pending updates when plugged in."
    ];

    if (getsHot === "yes") {
      issue = "Thermal issue";
      priority = "High";
      actions = [
        "Shut down the laptop and let it cool before heavy use.",
        "Check vents for dust or blocked airflow and use the laptop on a hard surface.",
        "If fan noise, heat, or shutdowns continue, consider a professional cleaning or thermal paste check."
      ];
    } else if (diskFull === "yes") {
      issue = "Cleanup or storage issue";
      priority = "High";
      actions = [
        "Free up space by removing old downloads, temporary files, and unused apps.",
        "Move large files such as videos or backups to external storage.",
        "Keep at least 15% to 20% of the system drive free for Windows and app updates."
      ];
    } else if (storageType === "hdd" && ramSize === "4" && startupApps === "yes") {
      issue = "Storage and RAM bottleneck";
      priority = "High";
      actions = [
        "Disable startup apps you do not need as soon as Windows opens.",
        "Upgrade from HDD to SSD if the laptop supports it.",
        "Consider upgrading from 4GB RAM to 8GB or more for smoother multitasking."
      ];
    } else if (updatesPending === "yes") {
      issue = "Update or maintenance issue";
      priority = "Medium";
      actions = [
        "Plug in the laptop and install pending Windows updates.",
        "Restart after updates complete, then test performance again.",
        "Check Device Manager or the manufacturer site for important driver updates."
      ];
    } else if (startupApps === "yes") {
      issue = "Startup app overload";
      priority = "Medium";
      actions = [
        "Open Task Manager and disable high-impact startup apps.",
        "Uninstall apps you no longer use.",
        "Restart and compare startup speed after reducing background apps."
      ];
    } else if (storageType === "hdd" || ramSize === "4") {
      issue = "Older hardware bottleneck";
      priority = "Medium";
      actions = [
        "Upgrade to an SSD if your laptop still uses an HDD.",
        "Upgrade RAM if your model supports it.",
        "Keep browser tabs and background apps limited until hardware is upgraded."
      ];
    }

    formatDiagnosisResult(result, `Likely main issue: ${issue}`, "Priority level", priority, actions);
  });
}

function initWifiTool() {
  const form = document.getElementById("wifi-form");
  const result = document.getElementById("wifi-result");

  if (!form || !result) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const oneDevice = getFieldValue("one-device");
    const farRouter = getFieldValue("far-router");
    const afterUpdate = getFieldValue("after-update");
    const powerSaving = getFieldValue("power-saving");
    const autoReconnect = getFieldValue("auto-reconnect");
    const batteryMore = getFieldValue("battery-more");

    if (!oneDevice || !farRouter || !afterUpdate || !powerSaving || !autoReconnect || !batteryMore) {
      showError(result, "Please answer every question before analyzing your Wi-Fi problem.");
      return;
    }

    let issue = "General Wi-Fi stability issue";
    let urgency = "basic fix";
    let actions = [
      "Restart the laptop and reconnect to the Wi-Fi network.",
      "Forget the network in Windows settings, then connect again.",
      "Restart the router if other devices also seem unstable."
    ];

    if (farRouter === "yes") {
      issue = "Weak signal or router environment issue";
      urgency = "router/environment fix";
      actions = [
        "Move closer to the router and test whether disconnects stop.",
        "Reduce walls, distance, and interference between the laptop and router.",
        "Try a different Wi-Fi band, such as 2.4 GHz for range or 5 GHz for speed nearby."
      ];
    } else if (afterUpdate === "yes") {
      issue = "Wi-Fi driver issue";
      urgency = "driver/network fix";
      actions = [
        "Update the Wi-Fi adapter driver from Windows Update or the laptop maker.",
        "If the problem started after a driver update, try rolling back the driver.",
        "Restart Windows after changing the driver and test the same network again."
      ];
    } else if (batteryMore === "yes" || powerSaving === "yes") {
      issue = "Wi-Fi power management issue";
      urgency = "driver/network fix";
      actions = [
        "Disable the option that lets Windows turn off the Wi-Fi adapter to save power.",
        "Use a balanced or performance power mode while testing.",
        "Update the Wi-Fi adapter driver if power settings keep resetting."
      ];
    } else if (autoReconnect === "no") {
      issue = "Saved network profile or settings issue";
      urgency = "basic fix";
      actions = [
        "Forget the Wi-Fi network and reconnect with the password.",
        "Check that Connect automatically is enabled for the network.",
        "Run Windows Network Reset only if simpler profile fixes do not work."
      ];
    } else if (oneDevice === "yes") {
      issue = "Local laptop network issue";
      urgency = "driver/network fix";
      actions = [
        "Restart the laptop and test another Wi-Fi network if possible.",
        "Update or reinstall the Wi-Fi adapter driver.",
        "Check adapter power settings and disable aggressive power saving."
      ];
    } else if (oneDevice === "no") {
      issue = "Router or internet environment issue";
      urgency = "router/environment fix";
      actions = [
        "Restart the router and modem, then wait a few minutes before testing.",
        "Check if several devices disconnect at the same time.",
        "Contact your internet provider if the whole network drops repeatedly."
      ];
    }

    formatDiagnosisResult(result, `Likely issue: ${issue}`, "Urgency", urgency, actions);
  });
}

function initDiskCleanupTool() {
  const form = document.getElementById("disk-cleanup-form");
  const result = document.getElementById("disk-cleanup-result");

  if (!form || !result) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const mainIssue = getFieldValue("disk-main-issue");
    const freeSpace = getFieldValue("free-space");
    const largeFiles = getFieldValue("large-files");
    const unusedApps = getFieldValue("unused-apps");
    const mediaStorage = getFieldValue("media-storage");
    const recycleEmptied = getFieldValue("recycle-emptied");

    if (!mainIssue || !freeSpace || !largeFiles || !unusedApps || !mediaStorage || !recycleEmptied) {
      showError(result, "Please answer every question before building your cleanup plan.");
      return;
    }

    let priority = "Routine cleanup";
    let summary = "Your storage does not look critical, but a careful cleanup can still keep Windows running smoothly.";
    let urgency = "Low";
    let actions = [
      "Review Downloads and Desktop for files you recognize and no longer need.",
      "Uninstall apps you know you no longer use.",
      "Open Windows Storage settings and review suggestions before deleting anything."
    ];

    if (freeSpace === "under-5") {
      priority = "Critically low disk space";
      summary = "Your drive is very low on free space, which can make Windows updates, apps, and daily use less reliable.";
      urgency = "High";
      actions = [
        "Empty Recycle Bin to recover space from files you already deleted.",
        "Remove or move large files from Downloads and Desktop.",
        "Uninstall unused apps you recognize.",
        "Move large photos, videos, backups, or installers off the laptop."
      ];
    } else if (mainIssue === "slow-pc" && (freeSpace === "5-20" || freeSpace === "under-5")) {
      priority = "Low storage affecting performance";
      summary = "Low free space can make a slow PC feel worse because Windows needs room for updates, caches, and temporary files.";
      urgency = freeSpace === "under-5" ? "High" : "Medium";
      actions = [
        "Free up space until the system drive has a comfortable buffer.",
        "Remove old downloads and duplicate files first.",
        "Uninstall apps you do not use.",
        "If the laptop still feels slow after cleanup, check startup apps and overheating."
      ];
    } else if (largeFiles === "yes" || mainIssue === "downloads-big") {
      priority = "Personal files taking up storage";
      summary = "Downloads, Desktop files, installers, and other personal files are likely using a noticeable amount of space.";
      urgency = freeSpace === "5-20" ? "Medium" : "Low";
      actions = [
        "Sort Downloads and Desktop by file size.",
        "Delete files you recognize and no longer need.",
        "Move large files you want to keep to external or cloud storage.",
        "Empty Recycle Bin after confirming you do not need those files."
      ];
    } else if (unusedApps === "yes") {
      priority = "Unnecessary programs using storage";
      summary = "Apps you no longer use may be taking up space and adding background clutter.";
      urgency = freeSpace === "5-20" ? "Medium" : "Low";
      actions = [
        "Open Installed apps in Windows settings.",
        "Sort by size and review apps you recognize.",
        "Uninstall old programs, games, or trial software you no longer need.",
        "Restart after removing large apps and check free space again."
      ];
    } else if (mediaStorage === "yes") {
      priority = "Media storage buildup";
      summary = "Photos and videos can quietly become the largest storage category on a laptop.";
      urgency = freeSpace === "5-20" ? "Medium" : "Low";
      actions = [
        "Move large videos, photo libraries, and backups to external or cloud storage.",
        "Keep only current projects or frequently used files on the laptop.",
        "Delete duplicate media files after confirming backups exist.",
        "Empty Recycle Bin once you are sure the moved files are safe."
      ];
    } else if (recycleEmptied === "no" || recycleEmptied === "not-sure") {
      priority = "Recycle Bin cleanup";
      summary = "Deleted files may still be using storage because Recycle Bin has not been emptied recently.";
      urgency = "Low";
      actions = [
        "Open Recycle Bin and review what is inside.",
        "Restore anything you still need.",
        "Empty Recycle Bin to reclaim storage.",
        "Check free space again after emptying it."
      ];
    }

    formatDiskCleanupResult(result, priority, summary, urgency, actions);
  });
}
})();
