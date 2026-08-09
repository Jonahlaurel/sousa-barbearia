import { NextResponse } from 'next/server';

export async function GET() {
  const urlAPI = process.env.NEXT_PUBLIC_EVOLUTION_URL;
  const apiKey = process.env.NEXT_PUBLIC_EVOLUTION_API_KEY;

  try {
    // 1. Tenta criar a instância para o barbeiro Sousa se ela não existir
    const respostaCriar = await fetch(`${urlAPI}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        instanceName: "sousa",
        qrcode: true
      })
    });

    // 2. Solicita o QR Code atualizado para conexão
    const respostaQR = await fetch(`${urlAPI}/instance/connect/sousa`, {
      method: 'GET',
      headers: { 'apikey': apiKey }
    });

    const dadosQR = await respostaQR.json();

    return NextResponse.json({ 
      status: "Verifique o campo 'base64' abaixo para ver o QR code", 
      dadosQR 
    });

  } catch (error) {
    return NextResponse.json({ erro: error.message }, { status: 500 });
  }
}