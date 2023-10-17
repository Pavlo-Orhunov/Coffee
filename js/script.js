"use strict"

window.addEventListener("load", windowLoad)

function windowLoad() {
  document.body.classList.add("loaded")

  // ----- animation --------------
  const items = document.querySelectorAll("[data-item]")

  const appearThreshold = 0

  const appearOptions = {
    threshold: appearThreshold,
  }

  const appearCallback = (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio >= appearThreshold) {
        entry.target.classList.add("active")
      } else {
        entry.target.classList.remove("active")
      }
    })
  }

  const appearObserver = new IntersectionObserver(appearCallback, appearOptions)

  items.forEach((item) => {
    appearObserver.observe(item)
  })

  const animateOnScroll = () => {
    items.forEach((item) => {
      const itemTop = item.getBoundingClientRect().top
      const windowHeight = window.innerHeight

      if (itemTop - windowHeight <= 0) {
        item.classList.add("active")
      } else {
        item.classList.remove("active")
      }
    })
  }

  window.addEventListener("scroll", animateOnScroll)

  // ----- slider --------------
  if (document.querySelector(".feedback__slider")) {
    const swiper = new Swiper(".feedback__slider", {
      speed: 500,
      loop: true,
      spaceBetween: 15,
      // Navigation arrows
      navigation: {
        nextEl: ".feedback__arrow-next",
        prevEl: ".feedback__arrow-prev",
      },
    })
  }
}

// ----- shrinking header on scroll --------------
// Get the header element
const headerElement = document.querySelector(".header")

// Define the callback function for the IntersectionObserver
const callback = function (entries, observer) {
  if (entries[0].isIntersecting) {
    headerElement.classList.remove("header--scrolled")
  } else {
    headerElement.classList.add("header--scrolled")
  }
}

// Create an IntersectionObserver instance with the callback function
const headerObserver = new IntersectionObserver(callback)

// Add error handling in case the header element is not found
if (headerElement) {
  // Observe the header element for changes
  headerObserver.observe(headerElement)
} else {
  console.error("Header element not found.")
}

// ------------- hamburger menu -------------
const iconMenu = document.querySelector(".icon-menu")
const menuBody = document.querySelector(".menu__body")
const menuLinks = document.querySelectorAll(".menu__link")

if (iconMenu) {
  iconMenu.addEventListener("click", function (e) {
    toggleMenu()
  })

  //event handlers for menu items
  menuLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      if (iconMenu.classList.contains("_active")) {
        toggleMenu()
      }
    })
  })

  // toggle menu function
  function toggleMenu() {
    document.body.classList.toggle("body--lock")
    iconMenu.classList.toggle("_active")
    menuBody.classList.toggle("_active")
  }

  // close hamburger menu on device rotating
  window.addEventListener("orientationchange", function () {
    if (document.body.classList.contains("body--lock")) {
      document.body.classList.remove("body--lock")
    }
    if (iconMenu.classList.contains("_active")) {
      iconMenu.classList.remove("_active")
    }
    if (menuBody.classList.contains("_active")) {
      menuBody.classList.remove("_active")
    }
  })
}
// ------------- END OF hamburger menu -------------

// ----- Spoilers ---------------------
const spoilersArray = document.querySelectorAll("[data-spoilers]")
if (spoilersArray.length > 0) {
  const spoilersRegular = Array.from(spoilersArray).filter(function (
    item,
    index,
    self
  ) {
    return !item.dataset.spoilers.split(",")[0]
  })

  if (spoilersRegular.length > 0) {
    initSpoilers(spoilersRegular)
  }

  const spoilersMedia = Array.from(spoilersArray).filter(function (
    item,
    index,
    self
  ) {
    return item.dataset.spoilers.split(",")[0]
  })

  if (spoilersMedia.length > 0) {
    const breakpointsArray = []
    spoilersMedia.forEach((item) => {
      const params = item.dataset.spoilers
      const breakpoint = {}
      const paramsArray = params.split(",")
      breakpoint.value = paramsArray[0]
      breakpoint.type = paramsArray[1] ? paramsArray[1].trim() : "max"
      breakpoint.item = item
      breakpointsArray.push(breakpoint)
    })

    let mediaQueries = breakpointsArray.map(function (item) {
      return (
        "(" +
        item.type +
        "-width: " +
        item.value +
        "px)," +
        item.value +
        "," +
        item.type
      )
    })
    mediaQueries = mediaQueries.filter(function (item, index, self) {
      return self.indexOf(item) === index
    })

    mediaQueries.forEach((breakpoint) => {
      const paramsArray = breakpoint.split(",")
      const mediaBreakpoint = paramsArray[1]
      const mediaType = paramsArray[2]
      const matchMedia = window.matchMedia(paramsArray[0])

      const spoilersArray = breakpointsArray.filter(function (item) {
        if (item.value === mediaBreakpoint && item.type === mediaType) {
          return true
        }
      })

      matchMedia.addListener(function () {
        initSpoilers(spoilersArray, matchMedia)
      })
      initSpoilers(spoilersArray, matchMedia)
    })
  }

  function initSpoilers(spoilersArray, matchMedia = false) {
    spoilersArray.forEach((spoilersBlock) => {
      spoilersBlock = matchMedia ? spoilersBlock.item : spoilersBlock
      if (matchMedia.matches || !matchMedia) {
        spoilersBlock.classList.add("_init")
        initSpoilerBody(spoilersBlock)
        spoilersBlock.addEventListener("click", setSpoilerAction)
      } else {
        spoilersBlock.classList.remove("_init")
        initSpoilerBody(spoilersBlock, false)
        spoilersBlock.removeEventListener("click", setSpoilerAction)
      }
    })
  }

  function initSpoilerBody(spoilersBlock, hideSpoilerBody = true) {
    const spoilerTitles = spoilersBlock.querySelectorAll("[data-spoiler]")
    if (spoilerTitles.length > 0) {
      spoilerTitles.forEach((spoilerTitle) => {
        if (hideSpoilerBody) {
          spoilerTitle.removeAttribute("tabindex")
          if (!spoilerTitle.classList.contains("_active")) {
            spoilerTitle.nextElementSibling.hidden = true
          }
        } else {
          spoilerTitle.setAttribute("tabindex", "-1")
          spoilerTitle.nextElementSibling.hidden = false
        }
      })
    }
  }
  function setSpoilerAction(e) {
    const el = e.target
    if (el.hasAttribute("data-spoiler") || el.closest("[data-spoiler]")) {
      const spoilerTitle = el.hasAttribute("data-spoiler")
        ? el
        : el.closest("[data-spoiler]")
      const spoilersBlock = spoilerTitle.closest("[data-spoilers]")
      const oneSpoiler = spoilersBlock.hasAttribute("data-one-spoiler")
        ? true
        : false
      if (!spoilersBlock.querySelectorAll("._slide").length) {
        if (oneSpoiler && !spoilerTitle.classList.contains("_active")) {
          hideSpoilersBody(spoilersBlock)
        }
        spoilerTitle.classList.toggle("_active")
        _slideToggle(spoilerTitle.nextElementSibling, 300)
      }
      e.preventDefault()
    }
  }
  function hideSpoilersBody(spoilersBlock) {
    const spoilerActiveTitle = spoilersBlock.querySelector(
      "[data-spoiler]._active"
    )
    if (spoilerActiveTitle) {
      spoilerActiveTitle.classList.remove("_active")
      _slideUp(spoilerActiveTitle.nextElementSibling, 300)
    }
  }
}

//SlideToggle
let _slideUp = (target, duration = 300) => {
  if (!target.classList.contains("_slide")) {
    target.classList.add("_slide")
    target.style.transitionProperty = "height, margin, padding"
    target.style.transitionDuration = duration + "ms"
    target.style.height = target.offsetHeight + "px"
    target.offsetHeight
    target.style.overflow = "hidden"
    target.style.height = 0
    target.style.paddingTop = 0
    target.style.paddingBottom = 0
    target.style.marginTop = 0
    target.style.marginBottom = 0
    window.setTimeout(() => {
      target.hidden = true
      target.style.removeProperty("height")
      target.style.removeProperty("padding-top")
      target.style.removeProperty("padding-bottom")
      target.style.removeProperty("margin-top")
      target.style.removeProperty("margin-bottom")
      target.style.removeProperty("overflow")
      target.style.removeProperty("transition-duration")
      target.style.removeProperty("transition-property")
      target.classList.remove("_slide")
    }, duration)
  }
}
let _slideDown = (target, duration = 300) => {
  if (!target.classList.contains("_slide")) {
    target.classList.add("_slide")
    if (target.hidden) {
      target.hidden = false
    }
    let height = target.offsetHeight
    target.style.overflow = "hidden"
    target.style.height = 0
    target.style.paddingTop = 0
    target.style.paddingBottom = 0
    target.style.marginTop = 0
    target.style.marginBottom = 0
    target.offsetHeight
    target.style.transitionProperty = "height, margin, padding"
    target.style.transitionDuration = duration + "ms"
    target.style.height = height + "px"
    target.style.removeProperty("padding-top")
    target.style.removeProperty("padding-bottom")
    target.style.removeProperty("margin-top")
    target.style.removeProperty("margin-bottom")
    window.setTimeout(() => {
      target.style.removeProperty("height")
      target.style.removeProperty("overflow")
      target.style.removeProperty("transition-duration")
      target.style.removeProperty("transition-property")
      target.classList.remove("_slide")
    }, duration)
  }
}
let _slideToggle = (target, duration = 300) => {
  if (target.hidden) {
    return _slideDown(target, duration)
  } else {
    return _slideUp(target, duration)
  }
}
