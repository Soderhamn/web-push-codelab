/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BCTJfJX9Q0mK7FAvGsTjfHdeODtmctaZrbk5HvmG4Jmd-6BWGkBkYceZ-ZnsH4qoECIvG5gV0dKtBq_Bfpb0Itc';

const pushButton = document.querySelector('.js-push-btn');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function initUI() {
  pushButton.addEventListener("click", () => {
    pushButton.disabled = true;
    if(isSubscribed) {
      //TODO: Unsubscribe
    } else {
      subscribeUser();
    }
  })

  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then((subscription) => {
    isSubscribed = !(subscription === null);

    if(isSubscribed) {
      console.log("User is subscribed");
    } else {
      console.log("User is NOT subscribed");
    }

    updateButton();
  })
}

function updateButton() {
  if(Notification.permission === "denied") {
    pushButton.textContent = "Push Messaging Blocked";
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if(isSubscribed) {
    pushButton.textContent = "Disable Push Messaging";
  } else {
    pushButton.textContent = "Enable Push Messaging";
  }

  pushButton.disabled = false;
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then((subscription) => {
    console.log("User is subscribed!");

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateButton();
  })
  .catch((err) => {
    console.log("Failed to subscribe the user: ", err);
    updateButton();
  })
}

function updateSubscriptionOnServer(subscription) {
  //I en riktig app, skicka subscription till backend
  const subscriptionJson = document.querySelector(".js-subscription-json");
  const subscriptionDetails = document.querySelector(".js-subscription-details");

  if(subscription) {
    subscriptionJson.textContent = JSON.stringify(subscription);
    subscriptionDetails.classList.remove("is-invisible");
  } else {
    subscriptionDetails.classList.add("is-invisible");
  }
}

  if("serviceWorker" in navigator && "PushManager" in window) {
    console.log("Service Worker and Push  are supported!");

    navigator.serviceWorker.register("sw.js")
    .then((swReg) => {
      console.log("Serive worker is registered", swReg);

      swRegistration = swReg;
      initUI();
    })
    .catch((err) => {
      console.log("Service Worker Error", err);
    })
  } else {
    console.warn("Push messaging is not supported");
    pushButton.textContent = "Push Not Supported";
  }


