defmodule ConstableWeb.AnnouncementShowLive do
  use ConstableWeb, :live_view

  alias Constable.{Announcement, Comment, Repo, Subscription, User}

  def render(assigns) do
    Phoenix.View.render(ConstableWeb.AnnouncementView, "show.html", assigns)
  end

  def mount(_, %{"id" => id, "current_user_id" => user_id}, socket) do
    announcement = Repo.get!(Announcement.with_announcement_list_assocs(), id)
    comment = Comment.create_changeset(%{})
    current_user = Repo.get(User.active(), user_id)

    subscription =
      Repo.get_by(Subscription,
        announcement_id: announcement.id,
        user_id: current_user.id
      )

    socket =
      assign(socket,
        announcement: announcement,
        comment_changeset: comment,
        subscription: subscription,
        users: Repo.all(User.active()),
        current_user: current_user,
        page_title: announcement.title
      )

    {:ok, socket}
  end
end
