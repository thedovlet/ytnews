"""add events and registrations

Revision ID: add_events_tables
Revises: da4b038fa7b2
Create Date: 2025-12-04

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_events_tables'
down_revision = 'da4b038fa7b2'
branch_labels = None
depends_on = None


def upgrade():
    # Create events table
    op.create_table(
        'events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('slug', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('excerpt', sa.Text(), nullable=True),
        sa.Column('cover_image', sa.String(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('event_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('registration_deadline', sa.DateTime(timezone=True), nullable=True),
        sa.Column('max_participants', sa.Integer(), nullable=True),
        sa.Column('status', sa.Enum('DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED', name='eventstatus'), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('organization_id', sa.Integer(), nullable=True),
        sa.Column('published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_events_id'), 'events', ['id'], unique=False)
    op.create_index(op.f('ix_events_slug'), 'events', ['slug'], unique=True)
    op.create_index(op.f('ix_events_title'), 'events', ['title'], unique=False)

    # Create event_registrations table
    op.create_table(
        'event_registrations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('event_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('guest_name', sa.String(), nullable=True),
        sa.Column('guest_email', sa.String(), nullable=True),
        sa.Column('guest_phone', sa.String(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'CONFIRMED', 'CANCELLED', name='registrationstatus'), nullable=False),
        sa.Column('registered_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['event_id'], ['events.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_event_registrations_id'), 'event_registrations', ['id'], unique=False)


def downgrade():
    op.drop_index(op.f('ix_event_registrations_id'), table_name='event_registrations')
    op.drop_table('event_registrations')
    op.drop_index(op.f('ix_events_title'), table_name='events')
    op.drop_index(op.f('ix_events_slug'), table_name='events')
    op.drop_index(op.f('ix_events_id'), table_name='events')
    op.drop_table('events')
