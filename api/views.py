from api.models import Bin, Item, Tag
from api.serializers import (
    BinSerializer,
    CreateUserSerializer,
    ItemReadSerializer,
    ItemSerializer,
    LoginUserSerializer,
    TagSerializer,
    UserSerializer
)
from django.contrib.auth.models import User
from knox.models import AuthToken
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet


class UserRegistration(GenericAPIView):
    serializer_class = CreateUserSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        _, token = AuthToken.objects.create(user)
        return Response({
            'user': UserSerializer(user, context=self.get_serializer_context()).data,
            'token': token
        })


class UserLogin(GenericAPIView):
    serializer_class = LoginUserSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        _, token = AuthToken.objects.create(user)
        return Response({
            'user': UserSerializer(user, context=self.get_serializer_context()).data,
            'token': token
        })


class UserViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = UserSerializer


class BinViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Bin.objects.all()
    serializer_class = BinSerializer
    filterset_fields = ('owner',)


class TagViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    filterset_fields = ('owner',)


class ItemViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Item.objects.all()
    filter_backends = (SearchFilter, DjangoFilterBackend)
    filterset_fields = ('owner', 'bin', 'tags')
    search_fields = ('name',)

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ItemReadSerializer
        return ItemSerializer
