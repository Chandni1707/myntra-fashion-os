import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div>
      <header>
        <h1>Myntra Fashion OS</h1>

        <div>
          <button onClick={() => navigate("/style-profile")}>
            My Style
          </button>

          <button onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main>
        <h2>See it anywhere. Make it yours. Be ready for what's next.</h2>

        <section>
  <h3>Universal Fashion Capture</h3>

  <p>
    Upload an image or video, or paste a public media URL to turn
    inspiration from anywhere into personalized fashion.
  </p>

  <button onClick={() => navigate("/capture")}>
    Capture Fashion Inspiration
  </button>
</section>

        <section>
          <h3>Life Event Planner</h3>

          <p>
            Prepare complete personalized looks for what's coming next.
          </p>

          <button disabled>
            Add Upcoming Event
          </button>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;