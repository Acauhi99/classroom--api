Functional Error Handling com TypeScript: um guia prático

Você já cansou de ver blocos de try/catch espalhados pelo código?
Eles funcionam, mas tornam frequentemente o fluxo difícil de seguir, escondem os erros e dificultam a composição de funções.

Neste artigo, vou te mostrar uma alternativa poderosa: o Functional Error Handling usando o tipo Either. Vamos entender os conceitos, criar a estrutura e aplicá-la em um caso real.

🚨 O problema com try/catch
Quando usamos try/catch, muitas vezes deixamos a responsabilidade do tratamento de erros para depois — ou pior, para outro desenvolvedor. Além disso:

O fluxo de controle se torna imprevisível
Os erros podem ser engolidos sem intenção
Testar comportamentos específicos exige simular exceções
E se existisse uma forma mais clara, explícita e segura de lidar com erros?

✅ A proposta: Functional Error Handling
Inspirado pela programação funcional, o Functional Error Handling propõe o seguinte:

Em vez de lançar exceções, retorne explicitamente um resultado de sucesso ou de erro.

O tipo Either<L, R> representa isso:

Left<L>: representa um erro
Right<R>: representa um sucesso
Essa abordagem força o consumidor da função a lidar com os dois casos, o que gera código mais robusto e previsível.

🛠️ Criando a classe Either
Vamos construir nossa estrutura base.

// Representa o erro
export class Left<L, R> {
readonly value: L;

constructor(value: L) {
this.value = value;
}

isLeft(): this is Left<L, R> {
return true;
}

isRight(): this is Right<L, R> {
return false;
}
}

// Representa o sucesso
export class Right<L, R> {
readonly value: R;

constructor(value: R) {
this.value = value;
}

isLeft(): this is Left<L, R> {
return false;
}

isRight(): this is Right<L, R> {
return true;
}
}

// Tipo utilitário
export type Either<L, R> = Left<L, R> | Right<L, R>;

export const left = <L, R>(value: L): Either<L, R> => new Left(value);
export const right = <L, R>(value: R): Either<L, R> => new Right(value);
Com isso, qualquer função pode retornar um Either<Erro, Sucesso> em vez de lançar exceções.

🎯 Vantagens de usar Either
Adotar Either traz diversos benefícios:

Tipagem forte com TypeScript
Sem exceções inesperadas
Fluxo de controle explícito
Fácil composição de funções
Código mais limpo e testável
E o melhor: quem chama a função é obrigado a tratar o erro de forma clara.

🔍 Exemplo real: DeletePostUseCase
Imagine que temos um sistema de rede social parecido com o Instagram. Vamos criar um use case para deletar um post, mas somente se o autor da requisição for o dono do post.

type DeletePostUseCaseInput = {
authorId: string;
postId: string;
};

type DeletePostUseCaseOutputSuccess = {
postId: string;
};

type DeletePostUseCaseOutputError =
| ResourceNotFoundError
| NotAllowedError;

type DeletePostUseCaseOutput = Either<
DeletePostUseCaseOutputError,
DeletePostUseCaseOutputSuccess

> ;

export class DeletePostUseCase {
constructor(private postRepository: PostRepository) {}

async execute({
authorId,
postId,
}: DeletePostUseCaseInput): Promise<DeletePostUseCaseOutput> {
const post = await this.postRepository.findById(postId);

    if (!post) {
      return left(new ResourceNotFoundError());
    }

    if (post.authorId.toString() !== authorId) {
      return left(new NotAllowedError());
    }

    await this.postRepository.delete(post);

    return right({ postId: post.id.toString()});

}
}
📦 Como consumir esse resultado?
Quem chamar esse use case vai ter que lidar com as duas possibilidades de retorno:

const result = await deletePostUseCase.execute(input);

if (result.isLeft()) {
// Lidar com o erro
console.error(result.value.message);
} else {
// Sucesso!
console.log('Post deletado:', result.value.postId);
}
Simples, direto e seguro.

🧪 Como testar o DeletePostUseCase
Uma das grandes vantagens de usar o padrão Either é que ele facilita bastante os testes, já que não precisamos lidar com exceções sendo lançadas. Vamos testar os três cenários possíveis:

Quando o post não é encontrado
it('should return ResourceNotFoundError if post does not exist', async () => {
const postRepository: PostRepository = {
findById: vi.fn().mockResolvedValue(null),
delete: vi.fn(),
};

const useCase = new DeletePostUseCase(postRepository);
const result = await useCase.execute({
authorId: 'user-1',
postId: 'post-1',
});

expect(result.isLeft()).toBe(true);
expect(result.value).toBeInstanceOf(ResourceNotFoundError);
}); 2. Quando o usuário não é o autor do post

it('should return NotAllowedError if user is not the post author', async () => {
const fakePost = { id: 'post-1', authorId: 'another-user' };

const postRepository: PostRepository = {
findById: vi.fn().mockResolvedValue(fakePost),
delete: vi.fn(),
};

const useCase = new DeletePostUseCase(postRepository);
const result = await useCase.execute({
authorId: 'user-1',
postId: 'post-1',
});

expect(result.isLeft()).toBe(true);
expect(result.value).toBeInstanceOf(NotAllowedError);
}); 3. Quando o post é deletado com sucesso

it('should delete the post and return success', async () => {
const fakePost = { id: 'post-1', authorId: 'user-1' };

const postRepository: PostRepository = {
findById: vi.fn().mockResolvedValue(fakePost),
delete: vi.fn(),
};

const useCase = new DeletePostUseCase(postRepository);
const result = await useCase.execute({
authorId: 'user-1',
postId: 'post-1',
});

expect(result.isRight()).toBe(true);
expect(result.value).toEqual({ postId: 'post-1' });
expect(postRepository.delete).toHaveBeenCalledWith(fakePost);
});
Com essa abordagem, os testes são simples e legíveis — não precisamos simular exceções ou usar try/catch nos próprios testes.

✨ Conclusão
Usar Either no lugar de try/catch transforma como você lida com erros no TypeScript.
Você passa a tratar os erros como valores, torna o código mais previsível e se aproxima de práticas funcionais modernas.

Se você curtiu esse artigo, me segue aqui no Medium, LinkedIn ou no Twitter!
Pretendo compartilhar mais conteúdos sobre arquitetura, TypeScript e programação funcional nos próximos dias. 🚀
