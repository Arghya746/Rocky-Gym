/* =====================================================
   FITNESS POINT INTERACTIVE JAVASCRIPT
===================================================== */


/* ================= THEME ================= */

const themeToggle =
    document.getElementById("themeToggle");

const savedTheme =
    localStorage.getItem("fitness-theme");

if (savedTheme === "light") {

    document.body.classList.add("light");

    themeToggle.textContent = "🌙";

} else {

    themeToggle.textContent = "☀";
}


themeToggle.addEventListener("click", () => {

    document.body.classList.toggle("light");

    const isLight =
        document.body.classList.contains("light");

    localStorage.setItem(
        "fitness-theme",
        isLight ? "light" : "dark"
    );

    themeToggle.textContent =
        isLight ? "🌙" : "☀";
});


/* ================= PLAN SELECTION ================= */

function selectPlan(plan, price) {

    showToast(
        `${plan} selected • ₹${price.toLocaleString("en-IN")}`
    );

    document.getElementById("contact")
        .scrollIntoView({
            behavior: "smooth"
        });
}


/* ================= TOAST ================= */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2800);
}


/* ================= DASHBOARD ================= */

function switchDashboard(panelName, button) {

    const panels =
        document.querySelectorAll(
            ".dashboard-panel"
        );

    const tabs =
        document.querySelectorAll(
            ".dashboard-tab"
        );


    panels.forEach(panel => {

        panel.classList.remove("active");

    });


    tabs.forEach(tab => {

        tab.classList.remove("active");

    });


    const selectedPanel =
        document.getElementById(panelName);

    if (selectedPanel) {

        selectedPanel.classList.add("active");

    }

    button.classList.add("active");
}


/* ================= COUNTER ANIMATION ================= */

function animateCounters() {

    const counters =
        document.querySelectorAll(
            "[data-count]"
        );

    counters.forEach(counter => {

        const target =
            Number(counter.dataset.count);

        let current = 0;

        const increment =
            Math.max(
                1,
                Math.ceil(target / 40)
            );

        const update = () => {

            current += increment;

            if (current >= target) {

                counter.textContent =
                    target;

                return;
            }

            counter.textContent =
                current;

            requestAnimationFrame(update);
        };

        update();
    });
}


/* ================= INTERSECTION OBSERVER ================= */

const dashboard =
    document.querySelector(".dashboard");

let counterStarted = false;

const observer =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (
                    entry.isIntersecting &&
                    !counterStarted
                ) {

                    counterStarted = true;

                    animateCounters();

                }

            });

        }, {
            threshold: .3
        }
    );


if (dashboard) {

    observer.observe(dashboard);

}


/* ================= FORM ================= */

function submitForm(event) {

    event.preventDefault();

    const name =
        document.getElementById("name").value.trim();

    const phone =
        document.getElementById("phone").value.trim();

    const goal =
        document.getElementById("goal").value;

    const message =
        document.getElementById("formMessage");


    if (!name || !phone) {

        message.textContent =
            "Please enter your name and phone number.";

        return;
    }


    if (!/^[0-9]{10}$/.test(phone)) {

        message.textContent =
            "Please enter a valid 10-digit phone number.";

        return;
    }


    message.textContent =
        `Thanks ${name}! Your ${goal.toLowerCase()} enquiry has been recorded in this demo.`;


    showToast(
        "Free trial request submitted!"
    );


    event.target.reset();
}


/* ================= SCROLL REVEAL ================= */

const revealElements =
    document.querySelectorAll(
        ".feature-card, .price-card, .testimonial, .contact-form"
    );


revealElements.forEach(element => {

    element.style.opacity = "0";

    element.style.transform =
        "translateY(30px)";

    element.style.transition =
        "opacity .7s ease, transform .7s ease";
});


const revealObserver =
    new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    entry.target.style.opacity =
                        "1";

                    entry.target.style.transform =
                        "translateY(0)";

                    revealObserver.unobserve(
                        entry.target
                    );
                }

            });

        }, {
            threshold: .15
        }
    );


revealElements.forEach(element => {

    revealObserver.observe(element);

});


/* ================= ACTIVE NAV ================= */

const sections =
    document.querySelectorAll(
        "section[id]"
    );

const navLinks =
    document.querySelectorAll(
        ".nav-links a"
    );


window.addEventListener(
    "scroll",
    () => {

        let current = "";

        sections.forEach(section => {

            const sectionTop =
                section.offsetTop - 150;

            if (
                window.scrollY >= sectionTop
            ) {

                current =
                    section.getAttribute("id");
            }

        });


        navLinks.forEach(link => {

            link.style.color = "";

            if (
                link.getAttribute("href") ===
                `#${current}`
            ) {

                link.style.color =
                    "var(--orange)";
            }

        });

    }
);


/* ================= MOUSE PARALLAX ================= */

const heroVisual =
    document.querySelector(".hero-visual");

if (heroVisual) {

    heroVisual.addEventListener(
        "mousemove",
        event => {

            const rect =
                heroVisual.getBoundingClientRect();

            const x =
                event.clientX - rect.left;

            const y =
                event.clientY - rect.top;

            const moveX =
                (x - rect.width / 2) / 30;

            const moveY =
                (y - rect.height / 2) / 30;


            const athlete =
                heroVisual.querySelector(
                    ".athlete"
                );

            if (athlete) {

                athlete.style.transform =
                    `translate(${moveX}px, ${moveY}px)`;
            }

        }
    );


    heroVisual.addEventListener(
        "mouseleave",
        () => {

            const athlete =
                heroVisual.querySelector(
                    ".athlete"
                );

            if (athlete) {

                athlete.style.transform =
                    "translate(0,0)";
            }

        }
    );
}