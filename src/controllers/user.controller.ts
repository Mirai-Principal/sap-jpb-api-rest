import type { Request, Response } from "express";

const users = [
  {
    id: "1",
    name: "Usuario Demo",
    email: "demo@example.com",
  },
  {
    id: "2",
    name: "Usuario Demo 2",
    email: "demo2@example.com",
  },
];

export const getUsers = (_req: Request, res: Response) => {
  res.status(200).json({
    data: users,
  });
};

export const getUserById = (req: Request, res: Response) => {
  const user = users.find((currentUser) => currentUser.id === req.params.id);

  if (!user) {
    res.status(404).json({
      message: "Usuario no encontrado",
    });
    return;
  }

  res.status(200).json({
    data: user,
  });
};
