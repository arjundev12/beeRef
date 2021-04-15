module.exports={
    globalDomain:"http://localhost:5000",
    publicKEY:`-----BEGIN PUBLIC KEY-----
    MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAJuVKf2GY4az/UPWLSWmCISgh2fpkZqb
    NApWzYEfc5dH5XLSTgK3YJb0ucJvBMV9Bt61QzBPI/wN8IUrkkiFf8UCAwEAAQ==
    -----END PUBLIC KEY-----`,
  
    privateKEY:`-----BEGIN RSA PRIVATE KEY-----
    MIIBOgIBAAJBAJuVKf2GY4az/UPWLSWmCISgh2fpkZqbNApWzYEfc5dH5XLSTgK3
    YJb0ucJvBMV9Bt61QzBPI/wN8IUrkkiFf8UCAwEAAQJAHe7v+kAd6++7PY76drDg
    GKxOAPcWNXnA5HBY74vekG9O0lCAEPeoD5qWG43CWUmMDv244gGEO9eCb6m9DJVT
    IQIhANMhk27u1nUtmNrh3UuidJdhQe18nzzReJfQnD9Y1j8NAiEAvKWEQlmAyNSQ
    zmifPzd1uCS184rpIdWpTHWJMsUU1ZkCIHxyDPnVM3lMEA3sFckwD3Lu87Isw5tQ
    iLlLT92S2m29AiEAtHr2KjRPDdSwJYnasTRyH5afrT09Be3QZyIb/MKoyCECIH4x
    gd+GSVCWZDHU63C3ZMXIH75HEzkdylwiK/XRUI5C
    -----END RSA PRIVATE KEY-----`,
    i: 'Isser', // Issuer
    s: 'Subject', // Subject
    algorithm: "RS256", // Audience  
    tempTokenExpiresTime:"7d",
    superSecret:"hawiltimads",
    auth_api_key: "fsjdos2dk58SHJkdjcmlsowuh",
    linkedingrand:'authorization_code',
    linkedindUri:'http://52.14.78.31:5001/load',
    linkedIndCleindId:'86cje79njjtb8l',
    linkedinClinetSecret:'eTf2Svw2KSNc9T17',
    smtp_settings : {
      host : "smtp.gmail.com",
      user: 'madstech421@gmail.com',
      password: 'madstech@123'
    }
}