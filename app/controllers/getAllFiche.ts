export const GetAllFiche = async (fichier) => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.error('Aucun token trouvé');
    }
    const formData = new FormData();
formData.append("file", fichier);

    try {
         const req = await fetch("http://localhost:2000/api/upload", {
        method: "POST",
         headers: {
                'Authorization': `Bearer ${token}`, // Si vous utilisez JWT
            },
             body: formData
        })
        const res = await req.json()
        console.log("fiche : ",res.data) 
        if (res.message ==="ok") {
            return res.data
        } else {
            console.log(res.message)
        }
    } catch (error) {
        console.log(error)
    }
}