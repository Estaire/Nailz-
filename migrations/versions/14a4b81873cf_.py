"""empty message

Revision ID: 14a4b81873cf
Revises: 8ab5dec7bbb3
Create Date: 2020-05-22 19:15:45.324984

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '14a4b81873cf'
down_revision = '8ab5dec7bbb3'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('follows_user_id_key', 'follows', type_='unique')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint('follows_user_id_key', 'follows', ['user_id'])
    # ### end Alembic commands ###
