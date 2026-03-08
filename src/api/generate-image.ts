// Временная заглушка для генерации изображений
// В будущем здесь будет интеграция с реальным API генерации изображений

export async function generateImage(prompt: string): Promise<{ imageUrl: string }> {
  // Симулируем задержку API
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Возвращаем placeholder изображение с текстом
  const encodedPrompt = encodeURIComponent(prompt.slice(0, 50));
  const imageUrl = `https://via.placeholder.com/800x800/4F46E5/FFFFFF?text=${encodedPrompt}`;
  
  return { imageUrl };
}