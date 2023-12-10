const express = require("express");
const router = express.Router();
const userModel = require("./users");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const upload = require('./multer')
const postModel = require('./post')

passport.use(new LocalStrategy(userModel.authenticate()));

// Home page
router.get("/", (req, res) => {
    res.render("index", { title: "Home", nav: false });
});

// Register page
router.get("/register", (req, res) => {
    res.render("register", { title: "Register", nav: false });
});

// Profile page logic with authentication check
router.get("/profile", isLoggedIn, async(req, res, next) => {
    const user = await userModel.findOne({ username: req.session.passport.user })
        .populate("posts")
    res.render("profile", { user, nav: true });
});

router.get("/add", isLoggedIn, async(req, res, next) => {
    const user = await userModel.findOne({ username: req.session.passport.user })
    res.render("add", { user, nav: true });
});
//upload logical of create post
router.post("/createpost", isLoggedIn, upload.single("postimage"), async(req, res, next) => {
    try {
        const user = await userModel.findOne({ username: req.session.passport.user });

        if (!user) {
            // Handle the case where the user is not found
            return res.status(404).send("User not found");
        }

        const post = await postModel.create({
            user: user._id,
            title: req.body.title,
            description: req.body.description,
            image: req.file.filename
        });

        user.posts.push(post._id);
        await user.save();

        res.redirect('/profile');
    } catch (error) {
        // Handle any errors that may occur during the process
        console.error(error);
        next(error);
    }
});
//show posts integration 
// router.get("/show/allposts", isLoggedIn, async(req, res, next) => {
//     const user = await userModel.findOne({ username: req.session.passport.user })
//         .populate("posts")
//     res.render("show", { user, nav: true });
// });

// Assuming you have a route to retrieve all posts from the database
router.get("/show/allposts", isLoggedIn, async(req, res) => {
    try {
        const allPosts = await postModel.find(); // Replace with your actual method to fetch posts

        res.render("show", { allPosts, nav: true });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


// file upload logic 
router.post("/fileupload", isLoggedIn, upload.single("image"), async(req, res, next) => {
    const user = await userModel.findOne({ username: req.session.passport.user })
    user.profilePic = req.file.filename;
    await user.save();
    res.redirect('/profile');

})


// Register user logic
router.post("/register", async(req, res) => {
    try {
        const data = {
            username: req.body.username,
            email: req.body.email,
            contact: req.body.contact,
        };

        const newUser = new userModel(data);
        await userModel.register(newUser, req.body.password);

        passport.authenticate("local")(req, res, () => {
            res.redirect("/");
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.redirect("/register");
    }
});

// Login page logic
router.post("/login", passport.authenticate("local", {
    failureRedirect: "/",
    successRedirect: "/profile",
}));

// Logout logic
router.get("/logout", (req, res, next) => {
    req.logout();
    res.redirect("/");
});

// Middleware to check if the user is authenticated
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}
//feed page


router.get('/feed', isLoggedIn, async(req, res) => {
    try {
        const user = await userModel.findOne({ username: req.session.passport.user })
        const posts = await postModel.find()
            .populate("user")

        res.render('feed', { posts, user, nav: true });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;