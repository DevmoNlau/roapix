const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/roblox/:username", async (req, res) => {
    try {
        const username = req.params.username;
        
        // Fetch user ID from Roblox
        let userResponse = await axios.post("https://users.roblox.com/v1/usernames/users", {
            usernames: [username],
            excludeBannedUsers: true
        });

        if (!userResponse.data.data.length) {
            return res.status(404).json({ error: "❌ User not found!" });
        }

        let userId = userResponse.data.data[0].id;
        let displayName = userResponse.data.data[0].displayName;

        // Fetch avatar and profile images
        let avatarUrl = await getAvatarProfile(userId);
        let profileImageUrl = await getProfileImage(userId);
        
        // Fetch friends, followers, and followings count
        let friendsCount = await getCount(`https://friends.roblox.com/v1/users/${userId}/friends/count`);
        let followersCount = await getCount(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
        let followingsCount = await getCount(`https://friends.roblox.com/v1/users/${userId}/followings/count`);

        // Send response with all data
        res.json({ 
            id: userId, 
            displayName, 
            avatarUrl, 
            profileImageUrl, 
            friendsCount, 
            followersCount, 
            followingsCount 
        });
    } catch (error) {
        console.error("❌ Error fetching data:", error);
        res.status(500).json({ error: "⚠️ There was an error fetching the data!" });
    }
});

// Function to fetch profile image from roproxy
async function getProfileImage(userId) {
    try {
        let response = await axios.get(`https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false`);
        return response.data.data[0].imageUrl;
    } catch (error) {
        console.error("❌ Error fetching avatar image:", error);
        return "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-Default-Png";
    }
}

// Function to fetch avatar profile image
async function getAvatarProfile(userId) {
    try {
        let apiUrl = `https://thumbnails.roproxy.com/v1/users/avatar?userIds=${userId}&size=352x352&format=Png&isCircular=false`;
        let response = await axios.get(apiUrl);
        return response.data.data[0].imageUrl;
    } catch (error) {
        console.error("❌ Error fetching profile image:", error);
        return "https://tr.rbxcdn.com/30DAY-AvatarHeadshot-Default-Png";
    }
}

// Function to fetch count data
async function getCount(url) {
    try {
        let response = await axios.get(url);
        return response.data.count;
    } catch (error) {
        console.error("❌ Error fetching count:", error);
        return 0;
    }
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
