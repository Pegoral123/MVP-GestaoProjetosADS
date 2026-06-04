from rest_framework import serializers

from apps.alunos.models import Aluno, AlunoGrupo


class AlunoService:

    @staticmethod
    def listar_alunos():
        """
        Retorna todos os alunos ordenados por nome.
        """
        return Aluno.objects.all()

    @staticmethod
    def buscar_por_id(aluno_id: int) -> Aluno:
        """
        Busca um aluno pelo ID.
        Lança erro 404 se não encontrar.
        """
        try:
            return Aluno.objects.get(id=aluno_id)
        except Aluno.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"id": "Aluno não encontrado."}
            ) from exc

    @staticmethod
    def criar_aluno(data: dict) -> Aluno:
        """
        Cria um novo aluno.
        Validações de unicidade já foram feitas no serializer.
        """
        return Aluno.objects.create(**data)

    @staticmethod
    def atualizar_aluno(aluno: Aluno, data: dict) -> Aluno:
        """
        Atualiza os dados de um aluno.
        """
        for campo, valor in data.items():
            setattr(aluno, campo, valor)
        aluno.save()
        return aluno

    @staticmethod
    def deletar_aluno(aluno_id: int) -> None:
        """
        Deleta um aluno.
        Regra: não pode deletar se estiver vinculado a um grupo.
        """
        try:
            aluno = Aluno.objects.get(id=aluno_id)
        except Aluno.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"id": "Aluno não encontrado."}
            ) from exc

        if aluno.aluno_grupos.exists():
            raise serializers.ValidationError(
                {"grupo": "Não é possível deletar um aluno vinculado a um grupo."}
            )

        aluno.delete()

    @staticmethod
    def vincular_grupo(aluno: Aluno, grupo) -> AlunoGrupo:
        """
        Vincula um aluno a um grupo.
        Regra: aluno não pode ser vinculado ao mesmo grupo duas vezes.
        """
        if AlunoGrupo.objects.filter(aluno=aluno, grupo=grupo).exists():
            raise serializers.ValidationError(
                {"grupo": "Aluno já está vinculado a esse grupo."}
            )

        return AlunoGrupo.objects.create(aluno=aluno, grupo=grupo)
    
    @staticmethod
    def desvincular_grupo(aluno: Aluno, grupo) -> None:
        """
        Desvincula um aluno de um grupo.
        Regra: vínculo precisa existir para ser removido.
        """
        try:
            vinculo = AlunoGrupo.objects.get(aluno=aluno, grupo=grupo)
        except AlunoGrupo.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"grupo": "Aluno não está vinculado a esse grupo."}
            ) from exc

        vinculo.delete()

    @staticmethod
    def lancar_nota(aluno: Aluno, grupo, nota) -> AlunoGrupo:
        """
        Lança ou atualiza a nota do aluno em um grupo.
        Regra: vínculo precisa existir antes de lançar nota.
        """
        try:
            vinculo = AlunoGrupo.objects.get(aluno=aluno, grupo=grupo)
        except AlunoGrupo.DoesNotExist as exc:
            raise serializers.ValidationError(
                {"grupo": "Aluno não está vinculado a esse grupo. Vincule primeiro."}
            ) from exc

        vinculo.nota = nota
        vinculo.save()
        return vinculo