
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from .models import SavedLocation, Pagoda
from .serializers import SavedLocationSerializer
from django.contrib.auth.models import User

# API to get all saved locations for a user
class SavedLocationListView(ListAPIView):
    serializer_class = SavedLocationSerializer

    def get_queryset(self):
        user_id = self.request.query_params.get('user_id')
        if user_id:
            return SavedLocation.objects.filter(user_id=user_id)
        return SavedLocation.objects.none()
class SaveLocationView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        user_id = request.data.get('user_id')
        pagoda_id = request.data.get('pagoda_id')
        if not user_id or not pagoda_id:
            return Response({'error': 'Missing user_id or pagoda_id'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(id=user_id)
            pagoda = Pagoda.objects.get(id=pagoda_id)
            saved, created = SavedLocation.objects.get_or_create(user=user, pagoda=pagoda)
            serializer = SavedLocationSerializer(saved)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Pagoda.DoesNotExist:
            return Response({'error': 'Pagoda not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    def post(self, request):
        print('LOGIN DEBUG:', request.data)
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None and user.is_active:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }, status=status.HTTP_200_OK)
        return Response({'error': 'Sai tài khoản hoặc mật khẩu'}, status=status.HTTP_401_UNAUTHORIZED)

class CheckUserInfoView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user is not None:
            return Response({
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
