#include <SFML/Graphics.hpp>

#include "lib/core/core.h"
#include <algorithm> // std::min

class Letter
	: public core::Drawable
	, public core::Kinematic
{
public:
	Letter(const sf::Vector2f& position, const sf::Vector2f& speed,
		const sf::Vector2f& acceleration)
		: Kinematic(position, speed, acceleration)
	{
	}
};

class Application
{
public:
	Application()
		: m_window(sf::VideoMode(800, 800), "initials")
	{
		m_text.setFont(m_font);

		if (!m_font.loadFromFile("assets/DejaVuSans.ttf"))
		{
			m_window.close();
			return;
		}
		m_text.setString(sf::String("SSU"));
		m_text.setCharacterSize(160);
		m_text.setFillColor(sf::Color::White);

		auto b = m_text.getLocalBounds();
		m_text.setOrigin(b.left + b.width * 0.5f, b.top + b.height * 0.5f);

		m_text.setPosition(400.f, m_groundY);

		m_velocityY = -m_jumpSpeed;
	}

	void Run()
	{
		while (m_window.isOpen())
		{
			float dt = m_clock.restart().asSeconds();
			dt = std::min(dt, 0.033f);

			HandleEvents();
			Update(dt);
			Draw();
		}
	}

private:
	void HandleEvents()
	{
		sf::Event e;
		while (m_window.pollEvent(e))
		{
			if (e.type == sf::Event::Closed)
				m_window.close();

			if (e.type == sf::Event::MouseButtonPressed
				&& e.mouseButton.button == sf::Mouse::Left)
			{
				m_velocityY = -m_jumpSpeed;
			}
		}
	}

	void Update(float dt)
	{
		m_velocityY += m_gravity * dt;

		sf::Vector2f pos = m_text.getPosition();
		pos.y += m_velocityY * dt;

		if (pos.y >= m_groundY)
		{
			pos.y = m_groundY;
			m_velocityY = -m_jumpSpeed;
		}

		m_text.setPosition(pos);
	}

	void Draw()
	{
		m_window.clear(sf::Color(20, 20, 25));
		m_window.draw(m_text);
		m_window.display();
	}

	sf::RenderWindow m_window;
	sf::Clock m_clock;

	sf::Font m_font;
	sf::Text m_text;

	float m_velocityY = 0.f;

	const float m_gravity = 1800.f;
	const float m_jumpSpeed = 900.f;
	const float m_groundY = 600.f;
};

int main()
{
	auto app = Application();
	app.Run();
}
