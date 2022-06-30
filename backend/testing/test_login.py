import pytest
import os, sys

def access_root_dir(depth = 1):
    current_dir = os.path.dirname(os.path.realpath(__file__))
    parent_dir = os.path.dirname(current_dir)
    args: list = [parent_dir]
    for _ in range(depth):
        args.append('..')
    
    rel_path = os.path.join(*args)
    sys.path.append(rel_path) 

access_root_dir(1)
from backend.app import app

@pytest.fixture
def client():
    return app.test_client()

def test_login(client, mocker):
    resp = client.post('/login', json={'username': 'k', 'password': 'k'})
    mocker.patch('backend.app.mongo_call', return_value={"demat_id": "8d54c01a-e3f9-4464-930b-9ed1bf60e3dd", "username": "k", "password": b'$2b$12$D5n50Ff4u3Lx3tI3OX1m4eR4sawvCJ2GbdzFXl0R3cOfVFxxsaBGi'})

    assert resp.json.get('status') == 'SUCCESS'
    assert isinstance(resp.json.get('demat_id'), str) == True

def test_bad_pw_login(client, mocker):
    resp = client.post('/login', json={'username': 'k', 'password': 'a'})
    mocker.patch('backend.app.mongo_call', return_value={"demat_id": "8d54c01a-e3f9-4464-930b-9ed1bf60e3dd", "username": "k", "password": b'$2b$12$D5n50Ff4u3Lx3tI3OX1m4eR4sawvCJ2GbdzFXl0R3cOfVFxxsaBGi'})
    assert resp.json.get('status') == 'INVALID PASSWORD'

def test_bad_username_login(client, mocker):
    resp = client.post('/login', json={'username': 'NFLXYZ', 'password': 'xyz'})
    mocker.patch('backend.app.mongo_call', return_value={None})
    assert resp.json.get('status') == 'INVALID USERNAME'    


def test_bad_http_method_login(client):
    resp = client.get('/login')
    assert resp.status_code == 405    