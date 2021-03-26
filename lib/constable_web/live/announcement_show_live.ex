defmodule ConstableWeb.AnnouncementShowLive do
  use ConstableWeb, :live_view

  alias Constable.{Announcement, Comment, Repo, Subscription, User}
  alias Constable.Services.CommentCreator

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
        comments: announcement.comments,
        comment_changeset: comment,
        subscription: subscription,
        users: Repo.all(User.active()),
        current_user: current_user,
        page_title: announcement.title
      )

    {:ok, socket}
  end

  def handle_event("create-comment", %{"comment" => params}, socket) do
    comment_params =
      params
      |> Map.put("user_id", socket.assigns.current_user.id)
      |> Map.put("announcement_id", socket.assigns.announcement.id)

    case CommentCreator.create(comment_params) do
      {:ok, comment} ->
        socket
        |> update(:comments, fn comments -> comments ++ [comment] end)
        |> assign(:comment_changeset, Comment.create_changeset(%{}))
        |> noreply()

      {:error, changeset} ->
        socket
        |> put_flash(:error, gettext("Comment was invalid"))
        |> assign(:comment_changeset, changeset)
        |> noreply()
    end
  end

  defp noreply(socket), do: {:noreply, socket}
end
