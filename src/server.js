import express, { response, text } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

const prisma = new PrismaClient();
const app = express();
const API_KEY = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(API_KEY);
dotenv.config();
app.use(cors());
app.use(express.json());

//Criar usuário
app.post('/usuarios', async (req, res) => {
    const { nome, telefone, email } = req.body;

    if (!nome || !telefone || !email) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }
    try {
        const user = await prisma.user.create({
            data: { nome, telefone, email },
        });
        res.status(201).json(user); 

         const message = {
            to: email,
            from: 'devemailthe@gmail.com',
            subject: `Olá ${nome}!!`,
            text: 'Você acabou de ser cadastrado na Lista de Contatos!',
        };

        sgMail
            .send(message)
            .then((response) => console.log('E-mail enviado..'))
            .catch((error) => console.log(error.message));
    } catch (error) {
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: "Erro ao criar usuário" });
    }
});

//Obter usuários
app.get('/usuarios', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json(users); 
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuários" });
    }
});

//Obter usuário por ID
app.get('/usuarios/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const user = await prisma.user.findUnique({
            where: { id: id },
        });

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
        }

        res.status(200).json(user); 
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar usuário" });
    }
});

//Editar usuário
app.put('/usuarios/:id', async (req, res) => {
    const { nome, telefone, email } = req.body;
    const id = req.params.id;

    if (!nome || !telefone || !email) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: { nome, telefone, email },
        });

        res.status(200).json(updatedUser); 
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
});

//Deletar usuário
app.delete('/usuarios/:id', async (req, res) => {
    const id = req.params.id;

    try {
        await prisma.user.delete({
            where: { id: id },
        });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar usuário" });
    }
});

app.listen(3000);
