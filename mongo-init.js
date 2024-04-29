db.createUser({
  user: "admin",
  pwd: "rootpassword",
  roles: [
    {
      role: "root",
      db: "admin",
    },
  ],
});
