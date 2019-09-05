const Api = {
    BASE_API: "http://localhost:5000",

    login(userinfo_md5_rsa) {
        return fetch(this.BASE_API + "/login", {
            method: "POST",
            body: JSON.stringify({userinfo_md5_rsa: userinfo_md5_rsa}),
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
    },

    auth(token_rsa) {
        return fetch(this.BASE_API + "/auth", {
            method: "GET",
            headers: {
                'Authorization': token_rsa,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
        });
    }
}

export default Api;