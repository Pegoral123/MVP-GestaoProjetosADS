from rest_framework import serializers

from apps.projetos.models import Projeto




def validar_nome(value, obrigatorio=True):
    """Validar nome do projeto: não vazio e máximo 150 caracteres."""
    if value is None:
        if obrigatorio:
            raise serializers.ValidationError("O nome do projeto é obrigatório.")
        return value
    
    if not value.strip():
        raise serializers.ValidationError("O nome do projeto não pode estar vazio.")
    if len(value) > 150:
        raise serializers.ValidationError("O nome não pode ter mais de 150 caracteres.")
    return value.strip()


def validar_descricao(value, obrigatorio=True):
    """Validar descrição: não vazia."""
    if value is None:
        if obrigatorio:
            raise serializers.ValidationError("A descrição é obrigatória.")
        return value
    
    if not value.strip():
        raise serializers.ValidationError("A descrição do projeto não pode estar vazia.")
    return value.strip()


def validar_mvp(value, obrigatorio=True):
    """Validar MVP contra opções válidas."""
    if value is None:
        if obrigatorio:
            raise serializers.ValidationError("O MVP é obrigatório.")
        return value
    
    valid_choices = [choice[0] for choice in Projeto.MVP.choices]
    if value not in valid_choices:
        raise serializers.ValidationError(
            f"MVP inválido. Escolha entre: {', '.join(valid_choices)}"
        )
    return value


def validar_ano(value, obrigatorio=True):
    """Validar ano: 4 dígitos numéricos, entre 1900 e 2100."""
    if value is None:
        if obrigatorio:
            raise serializers.ValidationError("O ano é obrigatório.")
        return value
    
    if not value.isdigit() or len(value) != 4:
        raise serializers.ValidationError("O ano deve ter 4 dígitos numéricos (ex: 2024).")
    
    ano_int = int(value)
    if ano_int < 1900 or ano_int > 2100:
        raise serializers.ValidationError("O ano deve estar entre 1900 e 2100.")
    return value


def validar_status(value, obrigatorio=True):
    """Validar status contra opções válidas."""
    if value is None:
        if obrigatorio:
            raise serializers.ValidationError("O status é obrigatório.")
        return value
    
    valid_choices = [choice[0] for choice in Projeto.Status.choices]
    if value not in valid_choices:
        raise serializers.ValidationError(
            f"Status inválido. Escolha entre: {', '.join(valid_choices)}"
        )
    return value


def validar_grupo(value):
    """Validar que o grupo existe."""
    if not value:
        raise serializers.ValidationError("O grupo é obrigatório.")
    return value



class ProjetoSerializer(serializers.ModelSerializer):
    """
    Serializer completo do Projeto — usado para listagem e detalhes.
    Exibe o nome do grupo ao invés do ID.
    """
    class Meta:
        model  = Projeto
        fields = (
            "id",
            "nome",
            "descricao",
            "mvp",
            "ano",
            "requisitos",
            "status",
            "criado_em",
            "atualizado_em",
        )
        read_only_fields = ("id", "criado_em", "atualizado_em")
    
    def validate_nome(self, value):
        return validar_nome(value, obrigatorio=True)
    
    def validate_descricao(self, value):
        return validar_descricao(value, obrigatorio=True)
    
    def validate_mvp(self, value):
        return validar_mvp(value, obrigatorio=True)
    
    def validate_ano(self, value):
        return validar_ano(value, obrigatorio=True)
    
    def validate_status(self, value):
        return validar_status(value, obrigatorio=True)


class CriarProjetoSerializer(serializers.ModelSerializer):
    """
    Serializer para criação de projeto com validações de entrada.
    Todos os campos são obrigatórios.
    """

    class Meta:
        model  = Projeto
        fields = (
            "nome",
            "descricao",
            "mvp",
            "ano",
            "requisitos",
            "status",
        )
    
    def validate_nome(self, value):
        return validar_nome(value, obrigatorio=True)
    
    def validate_descricao(self, value):
        return validar_descricao(value, obrigatorio=True)
    
    def validate_mvp(self, value):
        return validar_mvp(value, obrigatorio=True)
    
    def validate_ano(self, value):
        return validar_ano(value, obrigatorio=True)
    
    def validate_status(self, value):
        return validar_status(value, obrigatorio=True)
    
    def validate_grupo(self, value):
        return validar_grupo(value)


class AtualizarProjetoSerializer(serializers.ModelSerializer):
    """
    Serializer para atualização de projeto com validações de entrada.
    Permite atualizações parciais - campos são opcionais.
    """

    class Meta:
        model  = Projeto
        fields = (
            "nome",
            "descricao",
            "mvp",
            "ano",
            "requisitos",
            "status",
        )
    
    def validate_nome(self, value):
        return validar_nome(value, obrigatorio=False)
    
    def validate_descricao(self, value):
        return validar_descricao(value, obrigatorio=False)
    
    def validate_mvp(self, value):
        return validar_mvp(value, obrigatorio=False)
    
    def validate_ano(self, value):
        return validar_ano(value, obrigatorio=False)
    
    def validate_status(self, value):
        return validar_status(value, obrigatorio=False)
     