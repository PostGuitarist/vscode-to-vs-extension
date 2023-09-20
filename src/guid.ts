function generate_guid(): string {
    const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
    let guid = "";
    for (let i = 0; i < 8; i++) {
        guid += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    guid += "-";
    for (let i = 0; i < 4; i++) {
        guid += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    guid += "-";
    for (let i = 0; i < 4; i++) {
        guid += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    guid += "-";
    for (let i = 0; i < 12; i++) {
        guid += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return guid;
}